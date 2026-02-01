import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(eventId: string): Promise<object>;
    exportAttendees(eventId: string, format: "csv" | "xlsx" | undefined, res: Response): Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map