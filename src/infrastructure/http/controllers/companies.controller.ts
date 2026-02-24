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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import {
  GetCompaniesUseCase,
  GetCompanyBySlugUseCase,
  CreateCompanyUseCase,
  UpdateCompanyUseCase,
} from '../../../application/use-cases';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompanies: GetCompaniesUseCase,
    private readonly getCompanyBySlug: GetCompanyBySlugUseCase,
    private readonly createCompany: CreateCompanyUseCase,
    private readonly updateCompany: UpdateCompanyUseCase,
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

  @Get(':slug')
  @ApiOperation({ summary: 'Get company by slug' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.getCompanyBySlug.execute(slug);
  }
}
