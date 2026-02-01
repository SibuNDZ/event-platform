"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/database/prisma.service");
const tenant_service_1 = require("../../core/tenant/tenant.service");
const cache_service_1 = require("../../core/cache/cache.service");
const database_1 = require("@event-platform/database");
const utils_1 = require("@event-platform/shared/utils");
let EventsService = class EventsService {
    prisma;
    tenantService;
    cacheService;
    constructor(prisma, tenantService, cacheService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.cacheService = cacheService;
    }
    async create(dto) {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
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
                throw new common_1.ForbiddenException(`Event limit reached. Your plan allows ${features.maxEvents} events. Please upgrade.`);
            }
        }
        // Generate unique slug
        let slug = dto.slug || (0, utils_1.generateSlug)(dto.name);
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
                type: dto.type || database_1.EventType.IN_PERSON,
                status: database_1.EventStatus.DRAFT,
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
    async findAll(query) {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        const { page = 1, perPage = 20, status, type, search, sortBy = 'startDate', sortOrder = 'desc', } = query;
        const where = {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async findBySlug(slug, organizationSlug) {
        const where = {
            slug,
            deletedAt: null,
            status: database_1.EventStatus.PUBLISHED,
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
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async update(id, dto) {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
        }
        const event = await this.prisma.event.findFirst({
            where: { id, organizationId, deletedAt: null },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        // Handle slug change
        let slug = dto.slug;
        if (slug && slug !== event.slug) {
            const existing = await this.prisma.event.findUnique({
                where: { organizationId_slug: { organizationId, slug } },
            });
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException('Slug already in use');
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
    async publish(id) {
        const event = await this.findOne(id);
        if (event.status === database_1.EventStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Event is already published');
        }
        // Validate event has required data
        if (!event.startDate || !event.endDate) {
            throw new common_1.BadRequestException('Event must have start and end dates');
        }
        const updated = await this.prisma.event.update({
            where: { id },
            data: {
                status: database_1.EventStatus.PUBLISHED,
                publishedAt: new Date(),
            },
        });
        await this.invalidateEventCache(event.organizationId, id);
        return updated;
    }
    async unpublish(id) {
        const event = await this.findOne(id);
        if (event.status !== database_1.EventStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Event is not published');
        }
        const updated = await this.prisma.event.update({
            where: { id },
            data: {
                status: database_1.EventStatus.DRAFT,
            },
        });
        await this.invalidateEventCache(event.organizationId, id);
        return updated;
    }
    async cancel(id) {
        const event = await this.findOne(id);
        if (event.status === database_1.EventStatus.CANCELLED) {
            throw new common_1.BadRequestException('Event is already cancelled');
        }
        const updated = await this.prisma.event.update({
            where: { id },
            data: {
                status: database_1.EventStatus.CANCELLED,
            },
        });
        await this.invalidateEventCache(event.organizationId, id);
        return updated;
    }
    async delete(id) {
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
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
            throw new common_1.NotFoundException('Event not found');
        }
        // Soft delete if has orders, hard delete otherwise
        if (event._count.orders > 0) {
            await this.prisma.event.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        else {
            await this.prisma.event.delete({ where: { id } });
        }
        await this.invalidateEventCache(organizationId, id);
    }
    async getStats(id) {
        const event = await this.findOne(id);
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
    async duplicate(id) {
        const event = await this.findOne(id);
        const organizationId = this.tenantService.getOrganizationId();
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization context required');
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
                status: database_1.EventStatus.DRAFT,
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
    async invalidateEventCache(organizationId, eventId) {
        await this.cacheService.delPattern(`events:${organizationId}:*`);
        if (eventId) {
            await this.cacheService.del(`event:${eventId}`);
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        cache_service_1.CacheService])
], EventsService);
//# sourceMappingURL=events.service.js.map