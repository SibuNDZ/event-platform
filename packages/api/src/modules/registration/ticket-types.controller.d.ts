import { TicketTypesService } from './ticket-types.service';
import { TicketType } from '@event-platform/database';
export declare class TicketTypesController {
    private readonly ticketTypesService;
    constructor(ticketTypesService: TicketTypesService);
    create(eventId: string, dto: any): Promise<TicketType>;
    findAll(eventId: string): Promise<TicketType[]>;
    findOne(id: string): Promise<TicketType>;
    update(id: string, dto: any): Promise<TicketType>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=ticket-types.controller.d.ts.map