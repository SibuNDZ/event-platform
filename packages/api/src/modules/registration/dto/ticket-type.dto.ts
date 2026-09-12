import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendeeType } from '@event-platform/database';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Matches,
  MinLength,
} from 'class-validator';
import { CURRENCY_MESSAGE, ISO_CURRENCY_CODE } from '../../../common/currency';

export class CreateTicketTypeDto {
  @ApiProperty({ example: 'General Admission' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'ZAR' })
  @IsOptional()
  @IsString()
  @Matches(ISO_CURRENCY_CODE, { message: CURRENCY_MESSAGE })
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxPerOrder?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minPerOrder?: number;

  @ApiPropertyOptional({ enum: AttendeeType })
  @IsOptional()
  @IsEnum(AttendeeType)
  attendeeType?: AttendeeType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  salesStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  salesEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  earlyBirdPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  earlyBirdEndDate?: string;
}

export class UpdateTicketTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(ISO_CURRENCY_CODE, { message: CURRENCY_MESSAGE })
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxPerOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minPerOrder?: number;

  @ApiPropertyOptional({ enum: AttendeeType })
  @IsOptional()
  @IsEnum(AttendeeType)
  attendeeType?: AttendeeType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  salesStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  salesEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  earlyBirdPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  earlyBirdEndDate?: string;
}
