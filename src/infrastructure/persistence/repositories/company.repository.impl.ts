import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Company } from '../../../domain/entities';
import { ICompanyRepository, FindAllOptions, PaginatedResult, CompanySlug, UpsertCompanyData, BulkUpsertResult } from '../../../domain/repositories';

@Injectable()
export class CompanyRepositoryImpl implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<Company>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { industry: { contains: options.search, mode: 'insensitive' } },
        { ruc: { contains: options.search, mode: 'insensitive' } },
        { location: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    if (options.industry) {
      where.industry = { contains: options.industry, mode: 'insensitive' };
    }
    if (options.location) {
      where.location = { contains: options.location, mode: 'insensitive' };
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        orderBy: [
          { employeeCount: { sort: 'desc', nulls: 'last' } },
          { name: 'asc' },
        ],
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              positions: true,
              reviews: true,
              benefits: true,
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies.map(this.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllSlugs(): Promise<CompanySlug[]> {
    const companies = await this.prisma.company.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { slug: 'asc' },
    });
    return companies.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt }));
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    return company ? this.toDomain(company) : null;
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            positions: true,
            reviews: true,
            benefits: true,
          },
        },
      },
    });
    return company ? this.toDomain(company) : null;
  }

  async findByRuc(ruc: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { ruc },
      include: {
        _count: {
          select: {
            positions: true,
            reviews: true,
            benefits: true,
          },
        },
      },
    });
    return company ? this.toDomain(company) : null;
  }

  async create(data: Partial<Company>): Promise<Company> {
    const company = await this.prisma.company.create({
      data: {
        ruc: data.ruc,
        name: data.name!,
        slug: data.slug!,
        description: data.description,
        industry: data.industry,
        employeeCount: data.employeeCount,
        location: data.location,
        website: data.website,
        logoUrl: data.logoUrl,
        foundedYear: data.foundedYear,
        metadata: data.metadata || {},
      },
    });
    return this.toDomain(company);
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    const company = await this.prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        industry: data.industry,
        employeeCount: data.employeeCount,
        location: data.location,
        website: data.website,
        logoUrl: data.logoUrl,
        foundedYear: data.foundedYear,
        metadata: data.metadata,
      },
    });
    return this.toDomain(company);
  }

  async upsertByRuc(data: UpsertCompanyData): Promise<Company> {
    const company = await this.prisma.company.upsert({
      where: { ruc: data.ruc },
      create: {
        ruc: data.ruc,
        name: data.name,
        slug: data.slug,
        description: data.description,
        industry: data.industry,
        employeeCount: data.employeeCount,
        location: data.location,
        website: data.website,
        logoUrl: data.logoUrl,
        foundedYear: data.foundedYear,
        isVerified: data.isVerified ?? false,
        metadata: data.metadata ?? {},
      },
      update: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        industry: data.industry,
        employeeCount: data.employeeCount,
        location: data.location,
        website: data.website,
        logoUrl: data.logoUrl,
        foundedYear: data.foundedYear,
        isVerified: data.isVerified,
        metadata: data.metadata,
      },
    });
    return this.toDomain(company);
  }

  async bulkUpsertByRuc(items: UpsertCompanyData[]): Promise<BulkUpsertResult> {
    const result: BulkUpsertResult = { total: items.length, created: 0, updated: 0, errors: [] };

    // Process in batches of 50 using transactions
    const BATCH_SIZE = 50;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);

      await this.prisma.$transaction(async (tx) => {
        for (const data of batch) {
          try {
            const existing = await tx.company.findUnique({ where: { ruc: data.ruc } });
            if (existing) {
              await tx.company.update({
                where: { ruc: data.ruc },
                data: {
                  name: data.name,
                  slug: data.slug,
                  description: data.description,
                  industry: data.industry,
                  employeeCount: data.employeeCount,
                  location: data.location,
                  website: data.website,
                  logoUrl: data.logoUrl,
                  foundedYear: data.foundedYear,
                  isVerified: data.isVerified,
                  metadata: data.metadata,
                },
              });
              result.updated++;
            } else {
              await tx.company.create({
                data: {
                  ruc: data.ruc,
                  name: data.name,
                  slug: data.slug,
                  description: data.description,
                  industry: data.industry,
                  employeeCount: data.employeeCount,
                  location: data.location,
                  website: data.website,
                  logoUrl: data.logoUrl,
                  foundedYear: data.foundedYear,
                  isVerified: data.isVerified ?? false,
                  metadata: data.metadata ?? {},
                },
              });
              result.created++;
            }
          } catch (error: any) {
            result.errors.push({ ruc: data.ruc, error: error.message });
          }
        }
      });
    }

    return result;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }

  async search(query: string): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    return companies.map(this.toDomain);
  }

  private toDomain(data: any): Company {
    const company = Company.create({
      id: data.id,
      ruc: data.ruc,
      name: data.name,
      slug: data.slug,
      description: data.description,
      industry: data.industry,
      employeeCount: data.employeeCount,
      location: data.location,
      website: data.website,
      logoUrl: data.logoUrl,
      foundedYear: data.foundedYear,
      isVerified: data.isVerified,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    // Attach _count if included by Prisma
    if (data._count) {
      (company as any)._count = data._count;
    }
    return company;
  }
}
