import { AttendeesService } from './attendees.service';
import { Attendee } from '@event-platform/database';
export declare class AttendeesController {
    private readonly attendeesService;
    constructor(attendeesService: AttendeesService);
    findAll(eventId: string, query: any): Promise<object>;
    findOne(id: string): Promise<Attendee>;
    update(id: string, dto: any): Promise<Attendee>;
}
//# sourceMappingURL=attendees.controller.d.ts.map