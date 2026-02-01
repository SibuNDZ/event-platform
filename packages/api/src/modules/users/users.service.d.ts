import { PrismaService } from '../../core/database/prisma.service';
import { User } from '@event-platform/database';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
}
//# sourceMappingURL=users.service.d.ts.map