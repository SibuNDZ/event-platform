import { PrismaService } from '../../core/database/prisma.service';
import { TenantService } from '../../core/tenant/tenant.service';
import { CacheService } from '../../core/cache/cache.service';
import { Event, Prisma } from '@event-platform/database';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';
export declare class EventsService {
    private readonly prisma;
    private readonly tenantService;
    private readonly cacheService;
    constructor(prisma: PrismaService, tenantService: TenantService, cacheService: CacheService);
    create(dto: CreateEventDto): Promise<Event>;
    findAll(query: EventQueryDto): Promise<{
        items: {
            attendeeCount: number;
            orderCount: number;
            _count: {
                attendees: number;
                orders: number;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import("@event-platform/database").$Enums.EventStatus;
            description: string | null;
            currency: string;
            customDomain: string | null;
            organizationId: string;
            slug: string;
            shortDescription: string | null;
            type: import("@event-platform/database").$Enums.EventType;
            startDate: Date;
            endDate: Date;
            timezone: string;
            venueName: string | null;
            venueAddress: string | null;
            venueCity: string | null;
            venueCountry: string | null;
            venueLatitude: number | null;
            venueLongitude: number | null;
            virtualPlatformUrl: string | null;
            streamConfig: Prisma.JsonValue | null;
            coverImageUrl: string | null;
            logoUrl: string | null;
            bannerUrl: string | null;
            websiteEnabled: boolean;
            seoTitle: string | null;
            seoDescription: string | null;
            seoKeywords: string[];
            maxAttendees: number | null;
            isPublic: boolean;
            requireApproval: boolean;
            googleAnalyticsId: string | null;
            facebookPixelId: string | null;
            privacyPolicyUrl: string | null;
            termsUrl: string | null;
            publishedAt: Date | null;
            deletedAt: Date | null;
        }[];
        meta: {
            page: number;
            perPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Event>;
    findBySlug(slug: string, organizationSlug?: string): Promise<Event>;
    update(id: string, dto: UpdateEventDto): Promise<Event>;
    publish(id: string): Promise<Event>;
    unpublish(id: string): Promise<Event>;
    cancel(id: string): Promise<Event>;
    delete(id: string): Promise<void>;
    getStats(id: string): Promise<{
        totalAttendees: number;
        checkedIn: number;
        checkInRate: number;
        totalOrders: number;
        totalRevenue: number | Prisma.Decimal;
        attendeesByType: {
            type: import("@event-platform/database").$Enums.AttendeeType;
            count: number;
        }[];
    }>;
    duplicate(id: string): Promise<Event>;
    private invalidateEventCache;
}
//# sourceMappingURL=events.service.d.ts.map