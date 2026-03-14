import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiHeader } from '@nestjs/swagger';
import {
  GetCompaniesUseCase,
  GetCompanyBySlugUseCase,
  GetCompanySlugsUseCase,
  CreateCompanyUseCase,
  UpdateCompanyUseCase,
  UpsertCompanyUseCase,
  BulkUpsertCompaniesUseCase,
} from '../../../application/use-cases';
import { CreateCompanyDto, UpdateCompanyDto, UpsertCompanyDto, BulkUpsertCompaniesDto } from '../dto';
import { ApiKeyGuard } from '../../auth/api-key.guard';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompanies: GetCompaniesUseCase,
    private readonly getCompanyBySlug: GetCompanyBySlugUseCase,
    private readonly getCompanySlugs: GetCompanySlugsUseCase,
    private readonly createCompany: CreateCompanyUseCase,
    private readonly updateCompany: UpdateCompanyUseCase,
    private readonly upsertCompany: UpsertCompanyUseCase,
    private readonly bulkUpsertCompanies: BulkUpsertCompaniesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get companies with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'industry', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated list of companies' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @Query('location') location?: string,
  ) {
    return this.getCompanies.execute({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      industry: industry || undefined,
      location: location || undefined,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Company slug already exists' })
  async create(@Body() dto: CreateCompanyDto) {
    return this.createCompany.execute({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      industry: dto.industry,
      location: dto.location,
      website: dto.website,
      logo: dto.logo,
    });
  }

  @Put('upsert')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert a company by RUC (create or update)' })
  @ApiHeader({ name: 'x-api-key', description: 'Admin API key', required: true })
  @ApiBody({ type: UpsertCompanyDto })
  @ApiResponse({ status: 200, description: 'Company upserted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async upsert(@Body() dto: UpsertCompanyDto) {
    return this.upsertCompany.execute({
      ruc: dto.ruc,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      industry: dto.industry,
      employeeCount: dto.employeeCount,
      location: dto.location,
      website: dto.website,
      logoUrl: dto.logoUrl,
      foundedYear: dto.foundedYear,
      isVerified: dto.isVerified,
      metadata: dto.metadata,
    });
  }

  @Post('bulk')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk upsert companies by RUC (max 500 per request)' })
  @ApiHeader({ name: 'x-api-key', description: 'Admin API key', required: true })
  @ApiBody({ type: BulkUpsertCompaniesDto })
  @ApiResponse({ status: 200, description: 'Bulk upsert result with created/updated/error counts' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async bulkUpsert(@Body() dto: BulkUpsertCompaniesDto) {
    return this.bulkUpsertCompanies.execute(dto.companies);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing company' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 409, description: 'Company slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.updateCompany.execute(id, {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      industry: dto.industry,
      location: dto.location,
      website: dto.website,
      logo: dto.logo,
      removeLogo: dto.removeLogo,
    });
  }

  @Get('slugs')
  @ApiOperation({ summary: 'Get all company slugs for sitemap generation' })
  @ApiResponse({ status: 200, description: 'Array of {slug, updatedAt} for all companies' })
  async findAllSlugs() {
    return this.getCompanySlugs.execute();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get company by slug' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.getCompanyBySlug.execute(slug);
  }
}
