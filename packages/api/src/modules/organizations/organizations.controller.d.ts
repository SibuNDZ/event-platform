import { OrganizationsService } from './organizations.service';
import { Organization } from '@event-platform/database';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    getCurrent(): Promise<Organization>;
    update(dto: any): Promise<Organization>;
    getMembers(): Promise<object[]>;
}
//# sourceMappingURL=organizations.controller.d.ts.map