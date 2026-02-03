import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDemoLeadDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'jane@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Company Inc.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  company: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: '500-1000' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  eventSize?: string;

  @ApiPropertyOptional({ example: 'We run quarterly summits and need better analytics.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({ description: 'hCaptcha token from the frontend widget' })
  @IsOptional()
  @IsString()
  captchaToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmTerm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmContent?: string;
}
