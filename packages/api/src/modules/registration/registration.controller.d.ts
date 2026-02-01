import { RegistrationService } from './registration.service';
export declare class RegistrationController {
    private readonly registrationService;
    constructor(registrationService: RegistrationService);
    register(eventId: string, dto: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=registration.controller.d.ts.map