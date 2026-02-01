import { EventType, EventStatus } from '@event-platform/database';
export declare class CreateEventDto {
    name: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    type?: EventType;
    startDate: string;
    endDate: string;
    timezone?: string;
    venueName?: string;
    venueAddress?: string;
    venueCity?: string;
    venueCountry?: string;
    currency?: string;
    maxAttendees?: number;
    isPublic?: boolean;
}
export declare class UpdateEventDto {
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    type?: EventType;
    startDate?: string;
    endDate?: string;
    timezone?: string;
    venueName?: string;
    venueAddress?: string;
    venueCity?: string;
    venueCountry?: string;
    currency?: string;
    maxAttendees?: number;
    isPublic?: boolean;
    coverImageUrl?: string;
    logoUrl?: string;
}
export declare class EventQueryDto {
    page?: number;
    perPage?: number;
    status?: EventStatus;
    type?: EventType;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=event.dto.d.ts.map