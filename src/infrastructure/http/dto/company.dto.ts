// ============================================
// HTTP - DTOs: Company
// ============================================

import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Logo upload nested DTO
export class LogoUploadDto {
  @ApiProperty({
    description: 'Base64 encoded image data',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
  })
  @IsString()
  data: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'company-logo.png',
  })
  @IsString()
  @MaxLength(255)
  fileName: string;
}

// ============================================
// CREATE COMPANY DTO
// ============================================
export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'TechCorp Solutions',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  @MaxLength(100, { message: 'Company name cannot exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated from name if not provided)',
    example: 'techcorp-solutions',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Industry sector', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Company location', example: 'Lima, Perú', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Company website URL', example: 'https://techcorp.com' })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({ description: 'Company logo upload', type: LogoUploadDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoUploadDto)
  logo?: LogoUploadDto;
}

// ============================================
// UPDATE COMPANY DTO
// ============================================
export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: 'Company name', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: 'Company description', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Industry sector', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Company location', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({ description: 'Company logo upload', type: LogoUploadDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoUploadDto)
  logo?: LogoUploadDto;

  @ApiPropertyOptional({ description: 'Remove the current logo', example: false })
  @IsOptional()
  @IsBoolean()
  removeLogo?: boolean;
}
