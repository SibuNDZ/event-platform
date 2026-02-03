import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = corsOrigins.length
    ? corsOrigins
    : [configService.get<string>('FRONTEND_URL', 'http://localhost:3000')];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (server-to-server, health checks)
      if (!origin) return callback(null, true);
      // Allow exact matches from CORS_ORIGINS
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all Vercel preview deployments
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      // Allow custom domain
      if (origin.endsWith('.vibrant-events.co.za') || origin === 'https://vibrant-events.co.za') return callback(null, true);
      // Allow localhost in development
      if (origin.startsWith('http://localhost:')) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger Documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Event Platform API')
      .setDescription('Enterprise Event Management Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('organizations', 'Organization management')
      .addTag('events', 'Event management')
      .addTag('attendees', 'Attendee management')
      .addTag('tickets', 'Ticket management')
      .addTag('check-in', 'Check-in operations')
      .addTag('payments', 'Payment processing')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT') || configService.get<number>('API_PORT', 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
  console.log(`Swagger documentation: http://0.0.0.0:${port}/docs`);
}

bootstrap();
