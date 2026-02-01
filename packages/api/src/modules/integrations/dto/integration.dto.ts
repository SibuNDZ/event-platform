import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum IntegrationType {
  SALESFORCE = 'salesforce',
  HUBSPOT = 'hubspot',
  ZOHO = 'zoho',
  DYNAMICS = 'dynamics',
  PIPEDRIVE = 'pipedrive',
  CUSTOM = 'custom',
}

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Production API Key' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: ['read:events', 'read:attendees', 'write:attendees'],
    description: 'Permission scopes for the API key',
  })
  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class CreateIntegrationDto {
  @ApiProperty({ example: 'Salesforce Production' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: IntegrationType, example: IntegrationType.SALESFORCE })
  @IsEnum(IntegrationType)
  type: IntegrationType;

  @ApiPropertyOptional({
    description: 'Configuration specific to the integration type',
    example: { instanceUrl: 'https://mycompany.salesforce.com' },
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Field mapping from Event Platform to CRM',
    example: {
      attendee: {
        email: 'Email',
        firstName: 'FirstName',
        lastName: 'LastName',
      },
    },
  })
  @IsOptional()
  @IsObject()
  fieldMappings?: Record<string, Record<string, string>>;

  @ApiPropertyOptional({
    description: 'Events that trigger sync to CRM',
    example: ['attendee.created', 'attendee.checked_in'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  syncEvents?: string[];
}

export class UpdateIntegrationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  fieldMappings?: Record<string, Record<string, string>>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  syncEvents?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}

export class OAuthCallbackDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;
}
