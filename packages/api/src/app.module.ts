import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Core modules
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './core/auth/auth.module';
import { TenantModule } from './core/tenant/tenant.module';
import { CacheModule } from './core/cache/cache.module';
import { QueueModule } from './core/queue/queue.module';
import { StorageModule } from './core/storage/storage.module';

// Feature modules
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BadgesModule } from './modules/badges/badges.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// Interceptors
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
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
    DatabaseModule,
    AuthModule,
    TenantModule,
    CacheModule,
    QueueModule,
    StorageModule,

    // Feature modules
    OrganizationsModule,
    UsersModule,
    EventsModule,
    RegistrationModule,
    TicketsModule,
    CheckInModule,
    PaymentsModule,
    BadgesModule,
    CommunicationsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
