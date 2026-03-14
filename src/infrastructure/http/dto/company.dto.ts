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
  IsInt,
  IsObject,
  Min,
  Max,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
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

// ============================================
// UPSERT COMPANY DTO (for pipeline/admin ingestion)
// ============================================
export class UpsertCompanyDto {
  @ApiProperty({ description: 'RUC (11 digits)', example: '20100047218' })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'RUC must be exactly 11 digits' })
  ruc: string;

  @ApiProperty({ description: 'Company name', example: 'Banco de Crédito del Perú' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug (auto-generated from name if not provided)' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: 'Company description', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Industry sector', example: 'Financiero' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  industry?: string;

  @ApiPropertyOptional({ description: 'Number of employees', example: 7500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  @Type(() => Number)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Company location', example: 'Lima, Lima, La Molina' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ description: 'Logo URL (already uploaded)' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Year the company was founded', example: 1889 })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  @Type(() => Number)
  foundedYear?: number;

  @ApiPropertyOptional({ description: 'Whether the company data is verified', default: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Rich metadata from DatosPeru/SUNAT enrichment',
    example: { sector_economico: 'Intermediación Financiera', tipo_empresa: 'Sociedad Anonima Abierta' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ============================================
// BULK UPSERT COMPANIES DTO
// ============================================
export class BulkUpsertCompaniesDto {
  @ApiProperty({
    description: 'Array of companies to upsert (max 500 per request)',
    type: [UpsertCompanyDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least 1 company is required' })
  @ArrayMaxSize(500, { message: 'Maximum 500 companies per request' })
  @ValidateNested({ each: true })
  @Type(() => UpsertCompanyDto)
  companies: UpsertCompanyDto[];
}
