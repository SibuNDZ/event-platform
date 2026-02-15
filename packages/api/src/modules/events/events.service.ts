import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { CacheService } from '../../core/cache/cache.service';
import { Event, EventStatus, EventType, Prisma } from '@event-platform/database';
import { generateSlug } from '@event-platform/shared';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
    private readonly cacheService: CacheService
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // Check event limit based on tier
    const features = this.tenantService.getTierFeatures();
    if (features && features.maxEvents !== -1) {
      const eventCount = await this.prisma.event.count({
        where: {
          organizationId,
          deletedAt: null,
        },
      });

      if (eventCount >= features.maxEvents) {
        throw new ForbiddenException(
          `Event limit reached. Your plan allows ${features.maxEvents} events. Please upgrade.`
        );
      }
    }

    // Generate unique slug
    let slug = dto.slug || generateSlug(dto.name);
    const existingEvent = await this.prisma.event.findUnique({
      where: { organizationId_slug: { organizationId, slug } },
    });

    if (existingEvent) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const event = await this.prisma.event.create({
      data: {
        organizationId,
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        type: dto.type || EventType.IN_PERSON,
        status: EventStatus.DRAFT,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        timezone: dto.timezone || 'UTC',
        venueName: dto.venueName,
        venueAddress: dto.venueAddress,
        venueCity: dto.venueCity,
        venueCountry: dto.venueCountry,
        currency: dto.currency || 'USD',
        maxAttendees: dto.maxAttendees,
        isPublic: dto.isPublic ?? true,
      },
    });

    // Invalidate cache
    await this.invalidateEventCache(organizationId);

    return event;
  }

  async findAll(query: EventQueryDto) {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const {
      page = 1,
      perPage = 20,
      status,
      type,
      search,
      sortBy = 'startDate',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.EventWhereInput = {
      organizationId,
      deletedAt: null,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              attendees: true,
              orders: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      items: events.map((event) => ({
        ...event,
        attendeeCount: event._count.attendees,
        orderCount: event._count.orders,
      })),
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string): Promise<Event> {
    const organizationId = this.tenantService.getOrganizationId();

    const event = await this.prisma.event.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
        deletedAt: null,
      },
      include: {
        sessions: {
          orderBy: { startTime: 'asc' },
        },
        speakers: {
          orderBy: { sortOrder: 'asc' },
        },
        sponsors: {
          orderBy: { sortOrder: 'asc' },
        },
        ticketTypes: {
          orderBy: { sortOrder: 'asc' },
        },
        checkpoints: true,
        _count: {
          select: {
            attendees: true,
            orders: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findBySlug(slug: string, organizationSlug?: string): Promise<Event> {
    const where: Prisma.EventWhereInput = {
      slug,
      deletedAt: null,
      status: EventStatus.PUBLISHED,
    };

    if (organizationSlug) {
      where.organization = { slug: organizationSlug };
    }

    const event = await this.prisma.event.findFirst({
      where,
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        sessions: {
          where: { isLive: false },
          orderBy: { startTime: 'asc' },
          include: {
            speakers: {
              include: {
                speaker: true,
              },
            },
          },
        },
        speakers: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
        sponsors: {
          where: { isVisible: true },
          orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }],
        },
        ticketTypes: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const event = await this.prisma.event.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Handle slug change
    const slug = dto.slug;
    if (slug && slug !== event.slug) {
      const existing = await this.prisma.event.findUnique({
        where: { organizationId_slug: { organizationId, slug } },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Slug already in use');
      }
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
        ...(dto.type && { type: dto.type }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.timezone && { timezone: dto.timezone }),
        ...(dto.venueName !== undefined && { venueName: dto.venueName }),
        ...(dto.venueAddress !== undefined && { venueAddress: dto.venueAddress }),
        ...(dto.venueCity !== undefined && { venueCity: dto.venueCity }),
        ...(dto.venueCountry !== undefined && { venueCountry: dto.venueCountry }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.maxAttendees !== undefined && { maxAttendees: dto.maxAttendees }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
      },
    });

    await this.invalidateEventCache(organizationId, id);

    return updated;
  }

  async publish(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is already published');
    }

    // Validate event has required data
    if (!event.startDate || !event.endDate) {
      throw new BadRequestException('Event must have start and end dates');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    await this.invalidateEventCache(event.organizationId, id);

    return updated;
  }

  async unpublish(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not published');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.DRAFT,
      },
    });

    await this.invalidateEventCache(event.organizationId, id);

    return updated;
  }

  async cancel(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Event is already cancelled');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.CANCELLED,
      },
    });

    await this.invalidateEventCache(event.organizationId, id);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const event = await this.prisma.event.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        _count: {
          select: { orders: { where: { status: 'COMPLETED' } } },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Soft delete if has orders, hard delete otherwise
    if (event._count.orders > 0) {
      await this.prisma.event.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      await this.prisma.event.delete({ where: { id } });
    }

    await this.invalidateEventCache(organizationId, id);
  }

  async getStats(id: string) {
    await this.findOne(id);

    const [attendeeStats, orderStats, checkInStats] = await Promise.all([
      this.prisma.attendee.groupBy({
        by: ['attendeeType'],
        where: { eventId: id },
        _count: { id: true },
      }),
      this.prisma.order.aggregate({
        where: { eventId: id, status: 'COMPLETED' },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.checkIn.count({
        where: { ticket: { ticketType: { eventId: id } } },
      }),
    ]);

    const totalAttendees = attendeeStats.reduce((sum, stat) => sum + stat._count.id, 0);

    return {
      totalAttendees,
      checkedIn: checkInStats,
      checkInRate: totalAttendees > 0 ? (checkInStats / totalAttendees) * 100 : 0,
      totalOrders: orderStats._count.id,
      totalRevenue: orderStats._sum.total || 0,
      attendeesByType: attendeeStats.map((stat) => ({
        type: stat.attendeeType,
        count: stat._count.id,
      })),
    };
  }

  async duplicate(id: string): Promise<Event> {
    const event = await this.findOne(id);

    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // Generate new slug
    const slug = `${event.slug}-copy-${Date.now().toString(36)}`;

    const newEvent = await this.prisma.event.create({
      data: {
        organizationId,
        name: `${event.name} (Copy)`,
        slug,
        description: event.description,
        shortDescription: event.shortDescription,
        type: event.type,
        status: EventStatus.DRAFT,
        startDate: event.startDate,
        endDate: event.endDate,
        timezone: event.timezone,
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        venueCity: event.venueCity,
        venueCountry: event.venueCountry,
        currency: event.currency,
        maxAttendees: event.maxAttendees,
        isPublic: event.isPublic,
        coverImageUrl: event.coverImageUrl,
        logoUrl: event.logoUrl,
      },
    });

    await this.invalidateEventCache(organizationId);

    return newEvent;
  }

  private async invalidateEventCache(organizationId: string, eventId?: string) {
    await this.cacheService.delPattern(`events:${organizationId}:*`);
    if (eventId) {
      await this.cacheService.del(`event:${eventId}`);
    }
  }
}
