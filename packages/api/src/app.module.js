"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const throttler_2 = require("@nestjs/throttler");
// Core modules
const database_module_1 = require("./core/database/database.module");
const auth_module_1 = require("./core/auth/auth.module");
const tenant_module_1 = require("./core/tenant/tenant.module");
const cache_module_1 = require("./core/cache/cache.module");
const queue_module_1 = require("./core/queue/queue.module");
const storage_module_1 = require("./core/storage/storage.module");
// Feature modules
const organizations_module_1 = require("./modules/organizations/organizations.module");
const users_module_1 = require("./modules/users/users.module");
const events_module_1 = require("./modules/events/events.module");
const registration_module_1 = require("./modules/registration/registration.module");
const tickets_module_1 = require("./modules/tickets/tickets.module");
const check_in_module_1 = require("./modules/check-in/check-in.module");
const payments_module_1 = require("./modules/payments/payments.module");
const badges_module_1 = require("./modules/badges/badges.module");
const communications_module_1 = require("./modules/communications/communications.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
// Interceptors
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Configuration
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            // Rate limiting
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 10,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 50,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 200,
                },
            ]),
            // Core modules
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            tenant_module_1.TenantModule,
            cache_module_1.CacheModule,
            queue_module_1.QueueModule,
            storage_module_1.StorageModule,
            // Feature modules
            organizations_module_1.OrganizationsModule,
            users_module_1.UsersModule,
            events_module_1.EventsModule,
            registration_module_1.RegistrationModule,
            tickets_module_1.TicketsModule,
            check_in_module_1.CheckInModule,
            payments_module_1.PaymentsModule,
            badges_module_1.BadgesModule,
            communications_module_1.CommunicationsModule,
            analytics_module_1.AnalyticsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_2.ThrottlerGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map