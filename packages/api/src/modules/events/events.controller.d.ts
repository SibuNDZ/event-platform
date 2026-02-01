import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';
import { Event } from '@event-platform/database';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(dto: CreateEventDto): Promise<Event>;
    findAll(query: EventQueryDto): Promise<object>;
    findOne(id: string): Promise<Event>;
    findBySlug(slug: string, organizationSlug?: string): Promise<Event>;
    update(id: string, dto: UpdateEventDto): Promise<Event>;
    publish(id: string): Promise<Event>;
    unpublish(id: string): Promise<Event>;
    cancel(id: string): Promise<Event>;
    delete(id: string): Promise<void>;
    getStats(id: string): Promise<object>;
    duplicate(id: string): Promise<Event>;
}
//# sourceMappingURL=events.controller.d.ts.map