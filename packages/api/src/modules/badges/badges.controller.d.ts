import { BadgesService } from './badges.service';
import { BadgeTemplate } from '@event-platform/database';
export declare class BadgesController {
    private readonly badgesService;
    constructor(badgesService: BadgesService);
    createTemplate(eventId: string, dto: any): Promise<BadgeTemplate>;
    getTemplates(eventId: string): Promise<BadgeTemplate[]>;
    getTemplate(id: string): Promise<BadgeTemplate>;
    updateTemplate(id: string, dto: any): Promise<BadgeTemplate>;
    deleteTemplate(id: string): Promise<void>;
}
//# sourceMappingURL=badges.controller.d.ts.map