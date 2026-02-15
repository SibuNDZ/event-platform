import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { EventSession } from '@event-platform/database';

export interface CreateSessionDto {
  eventId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  track?: string;
  roomName?: string;
  capacity?: number;
}

export interface UpdateSessionDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  track?: string;
  roomName?: string;
  capacity?: number;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async create(dto: CreateSessionDto): Promise<EventSession> {
    // Verify event belongs to organization
    await this.verifyEventAccess(dto.eventId);

    return this.prisma.eventSession.create({
      data: {
        eventId: dto.eventId,
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        track: dto.track,
        roomName: dto.roomName,
        capacity: dto.capacity,
      },
    });
  }

  async findByEvent(eventId: string): Promise<EventSession[]> {
    await this.verifyEventAccess(eventId);

    return this.prisma.eventSession.findMany({
      where: { eventId },
      orderBy: { startTime: 'asc' },
      include: {
        speakers: {
          include: { speaker: true },
        },
      },
    });
  }

  async findOne(id: string): Promise<EventSession> {
    const session = await this.prisma.eventSession.findUnique({
      where: { id },
      include: {
        event: true,
        speakers: {
          include: { speaker: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.verifyEventAccess(session.eventId);

    return session;
  }

  async update(id: string, dto: UpdateSessionDto): Promise<EventSession> {
    await this.findOne(id);

    return this.prisma.eventSession.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
        ...(dto.track !== undefined && { track: dto.track }),
        ...(dto.roomName !== undefined && { roomName: dto.roomName }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.eventSession.delete({ where: { id } });
  }

  private async verifyEventAccess(eventId: string): Promise<void> {
    const organizationId = this.tenantService.getOrganizationId();
    if (!organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
  }
}
