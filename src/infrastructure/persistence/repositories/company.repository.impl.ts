import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Company } from '../../../domain/entities';
import { ICompanyRepository, FindAllOptions, PaginatedResult, CompanySlug, UpsertCompanyData, BulkUpsertResult, SyncResult } from '../../../domain/repositories';

@Injectable()
export class CompanyRepositoryImpl implements ICompanyRepository {
  private readonly logger = new Logger(CompanyRepositoryImpl.name);

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

  // ============================================
  // Sync from empliq_dev via dblink (cross-database)
  // Both databases live in the same PostgreSQL cluster
  // ============================================
  async syncFromDev(mode: 'full' | 'delta'): Promise<SyncResult> {
    const start = Date.now();
    const errors: string[] = [];
    let sourceTotal = 0;
    let created = 0;
    let updated = 0;
    let deleted = 0;
    let logoUpdated = 0;

    try {
      // Ensure dblink extension is available
      await this.prisma.$queryRawUnsafe('CREATE EXTENSION IF NOT EXISTS dblink');
      await this.prisma.$queryRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // Get source count
      const sourceCountResult = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(`
        SELECT count FROM dblink(
          'dbname=empliq_dev user=postgres password=postgres123',
          $q$SELECT count(*)::bigint FROM companies_raw WHERE data->>'scrape_status' = 'enriched'$q$
        ) AS t(count bigint)
      `);
      sourceTotal = Number(sourceCountResult[0]?.count ?? 0);

      if (mode === 'full') {
        // Full mode: delete all companies and re-insert everything
        this.logger.log(`Full sync: clearing all companies before migration`);

        // Count existing before delete
        const existingCount = await this.prisma.company.count();

        // Delete dependent data first (respect FK constraints)
        await this.prisma.$queryRawUnsafe('DELETE FROM benefits');
        await this.prisma.$queryRawUnsafe('DELETE FROM salaries');
        await this.prisma.$queryRawUnsafe('DELETE FROM reviews');
        await this.prisma.$queryRawUnsafe('DELETE FROM interviews');
        await this.prisma.$queryRawUnsafe('DELETE FROM positions');
        await this.prisma.$queryRawUnsafe('DELETE FROM companies');
        deleted = existingCount;

        this.logger.log(`Full sync: deleted ${deleted} existing companies, inserting ${sourceTotal} from source`);

        // Insert all enriched companies via dblink with slug deduplication
        const insertResult = await this.prisma.$queryRawUnsafe<{ created: bigint }[]>(
          this.buildFullInsertSQL(),
        );
        created = Number(insertResult[0]?.created ?? 0);
      } else {
        // Delta mode: UPSERT only new + changed companies
        this.logger.log(`Delta sync: detecting changes across ${sourceTotal} source companies`);

        // Count companies with logo changes (for reporting)
        const logoCountResult = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(`
          SELECT count FROM dblink(
            'dbname=empliq_dev user=postgres password=postgres123',
            $q$
              SELECT count(*)::bigint
              FROM companies_raw
              WHERE data->>'scrape_status' = 'enriched'
                AND logo_bucket_url IS NOT NULL
                AND logo_bucket_url != ''
            $q$
          ) AS t(count bigint)
        `);
        const sourceWithLogo = Number(logoCountResult[0]?.count ?? 0);

        // Run the delta upsert (INSERT ... ON CONFLICT DO UPDATE)
        // Uses xmax to distinguish created vs updated rows
        const upsertResult = await this.prisma.$queryRawUnsafe<
          { total: bigint; new_rows: bigint; updated_rows: bigint }[]
        >(this.buildDeltaUpsertSQL());

        const row = upsertResult[0];
        created = Number(row?.new_rows ?? 0);
        updated = Number(row?.updated_rows ?? 0);

        // Count logo updates separately (companies that now have a logo they didn't have before)
        const logoUpdateResult = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(`
          SELECT count(*)::bigint as count FROM companies
          WHERE logo_url IS NOT NULL AND logo_url != ''
        `);
        logoUpdated = Number(logoUpdateResult[0]?.count ?? 0);

        this.logger.log(
          `Delta sync: source has ${sourceWithLogo} with logos, prod has ${logoUpdated} with logos`,
        );
      }
    } catch (error: any) {
      this.logger.error(`Sync failed: ${error.message}`, error.stack);
      errors.push(error.message);
    }

    const durationMs = Date.now() - start;
    const unchanged = Math.max(0, sourceTotal - created - updated);

    return {
      mode,
      sourceTotal,
      created,
      updated,
      unchanged,
      logoUpdated,
      deleted,
      errors,
      durationMs,
    };
  }

  /**
   * SQL for FULL mode: DELETE all + INSERT all enriched companies.
   * Uses ROW_NUMBER for clean slug deduplication.
   */
  private buildFullInsertSQL(): string {
    return `
      WITH source AS (
        SELECT * FROM dblink(
          'dbname=empliq_dev user=postgres password=postgres123',
          $q$
            SELECT
              ruc,
              razon_social,
              COALESCE(logo_bucket_url, '') as logo_bucket_url,
              data
            FROM companies_raw
            WHERE data->>'scrape_status' = 'enriched'
            ORDER BY (CASE WHEN (data->>'nro_trabajadores') ~ '^\\d+$' THEN (data->>'nro_trabajadores')::int ELSE 0 END) DESC
          $q$
        ) AS t(ruc varchar, razon_social varchar, logo_bucket_url text, data jsonb)
      ),
      transformed AS (
        SELECT
          uuid_generate_v4() as id,
          ruc,
          COALESCE(NULLIF(trim(data->>'name'), ''), trim(razon_social), 'Sin Nombre') as name,
          ${this.slugSQL()} as base_slug,
          NULLIF(trim(data->>'description'), '') as description,
          COALESCE(NULLIF(trim(data->>'sector_economico'), ''), NULLIF(trim(data->>'industry'), '')) as industry,
          CASE WHEN (data->>'nro_trabajadores') ~ '^\\d+$' THEN (data->>'nro_trabajadores')::int ELSE NULL END as employee_count,
          ${this.locationSQL()} as location,
          NULLIF(trim(data->>'website'), '') as website,
          NULLIF(trim(logo_bucket_url), '') as logo_url,
          ${this.foundedYearSQL()} as founded_year,
          false as is_verified,
          ${this.metadataSQL()} as metadata,
          NOW() as created_at,
          NOW() as updated_at
        FROM source
      ),
      slugged AS (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY employee_count DESC NULLS LAST) as rn
        FROM transformed
      ),
      inserted AS (
        INSERT INTO companies (
          id, ruc, name, slug, description, industry, employee_count,
          location, website, logo_url, founded_year, is_verified,
          metadata, created_at, updated_at
        )
        SELECT
          id, ruc, name,
          CASE WHEN rn = 1 THEN base_slug ELSE base_slug || '-' || ruc END as slug,
          description, industry, employee_count, location, website,
          logo_url, founded_year, is_verified, metadata, created_at, updated_at
        FROM slugged
        RETURNING 1
      )
      SELECT count(*)::bigint as created FROM inserted
    `;
  }

  /**
   * SQL for DELTA mode: UPSERT only new/changed companies.
   * New companies get slug with -ruc suffix (guaranteed unique).
   * Existing companies keep their current slug.
   * Only updates rows where data actually changed.
   */
  private buildDeltaUpsertSQL(): string {
    return `
      WITH source AS (
        SELECT * FROM dblink(
          'dbname=empliq_dev user=postgres password=postgres123',
          $q$
            SELECT
              ruc,
              razon_social,
              COALESCE(logo_bucket_url, '') as logo_bucket_url,
              data
            FROM companies_raw
            WHERE data->>'scrape_status' = 'enriched'
          $q$
        ) AS t(ruc varchar, razon_social varchar, logo_bucket_url text, data jsonb)
      ),
      transformed AS (
        SELECT
          uuid_generate_v4() as id,
          ruc,
          COALESCE(NULLIF(trim(data->>'name'), ''), trim(razon_social), 'Sin Nombre') as name,
          ${this.slugSQL()} || '-' || ruc as slug,
          NULLIF(trim(data->>'description'), '') as description,
          COALESCE(NULLIF(trim(data->>'sector_economico'), ''), NULLIF(trim(data->>'industry'), '')) as industry,
          CASE WHEN (data->>'nro_trabajadores') ~ '^\\d+$' THEN (data->>'nro_trabajadores')::int ELSE NULL END as employee_count,
          ${this.locationSQL()} as location,
          NULLIF(trim(data->>'website'), '') as website,
          NULLIF(trim(logo_bucket_url), '') as logo_url,
          ${this.foundedYearSQL()} as founded_year,
          false as is_verified,
          ${this.metadataSQL()} as metadata,
          NOW() as created_at,
          NOW() as updated_at
        FROM source
      ),
      upserted AS (
        INSERT INTO companies (
          id, ruc, name, slug, description, industry, employee_count,
          location, website, logo_url, founded_year, is_verified,
          metadata, created_at, updated_at
        )
        SELECT
          id, ruc, name, slug, description, industry, employee_count,
          location, website, logo_url, founded_year, is_verified,
          metadata, created_at, updated_at
        FROM transformed
        ON CONFLICT (ruc) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          industry = EXCLUDED.industry,
          employee_count = EXCLUDED.employee_count,
          location = EXCLUDED.location,
          website = EXCLUDED.website,
          logo_url = EXCLUDED.logo_url,
          founded_year = EXCLUDED.founded_year,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        WHERE
          companies.name IS DISTINCT FROM EXCLUDED.name
          OR companies.description IS DISTINCT FROM EXCLUDED.description
          OR companies.industry IS DISTINCT FROM EXCLUDED.industry
          OR companies.employee_count IS DISTINCT FROM EXCLUDED.employee_count
          OR companies.location IS DISTINCT FROM EXCLUDED.location
          OR companies.website IS DISTINCT FROM EXCLUDED.website
          OR companies.logo_url IS DISTINCT FROM EXCLUDED.logo_url
          OR companies.founded_year IS DISTINCT FROM EXCLUDED.founded_year
        RETURNING xmax
      )
      SELECT
        count(*)::bigint as total,
        count(*) FILTER (WHERE xmax = 0)::bigint as new_rows,
        count(*) FILTER (WHERE xmax != 0)::bigint as updated_rows
      FROM upserted
    `;
  }

  // ---- Shared SQL fragments ----

  private slugSQL(): string {
    return `
      (SELECT
        trim(both '-' from
          regexp_replace(
            translate(
              lower(trim(COALESCE(NULLIF(trim(data->>'name'), ''), trim(razon_social), 'Sin Nombre'))),
              'áàäâéèëêíìïîóòöôúùüûñÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑ',
              'aaaaeeeeiiiioooouuuunaaaaeeeeiiiioooouuuun'
            ),
            '[^a-z0-9]+', '-', 'g'
          )
        )
      )`;
  }

  private locationSQL(): string {
    return `
      NULLIF(
        array_to_string(
          ARRAY(
            SELECT v FROM unnest(ARRAY[
              NULLIF(NULLIF(trim(data->>'distrito'), ''), '-'),
              NULLIF(NULLIF(trim(data->>'provincia'), ''), '-'),
              NULLIF(NULLIF(trim(data->>'departamento'), ''), '-')
            ]) AS v WHERE v IS NOT NULL
          ), ', '
        ), ''
      )`;
  }

  private foundedYearSQL(): string {
    return `
      CASE
        WHEN data->>'fecha_inicio' ~ '^\\d{2}/\\d{2}/\\d{4}$'
        THEN (split_part(data->>'fecha_inicio', '/', 3))::int
        WHEN (data->>'founded_year') ~ '^\\d{4}$'
        THEN (data->>'founded_year')::int
        ELSE NULL
      END`;
  }

  private metadataSQL(): string {
    return `
      jsonb_strip_nulls(jsonb_build_object(
        'razon_social', razon_social,
        'source', 'empliq_dev',
        'migrated_at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'direccion', NULLIF(trim(data->>'direccion'), ''),
        'distrito', NULLIF(NULLIF(trim(data->>'distrito'), ''), '-'),
        'provincia', NULLIF(NULLIF(trim(data->>'provincia'), ''), '-'),
        'departamento', NULLIF(NULLIF(trim(data->>'departamento'), ''), '-'),
        'sector_economico', NULLIF(trim(data->>'sector_economico'), ''),
        'actividad_ciiu', NULLIF(trim(data->>'actividad_ciiu'), ''),
        'tipo_empresa', NULLIF(trim(data->>'tipo_empresa'), ''),
        'condicion', NULLIF(trim(data->>'condicion'), ''),
        'estado', NULLIF(trim(data->>'estado'), ''),
        'fecha_inicio', NULLIF(trim(data->>'fecha_inicio'), ''),
        'fecha_inscripcion', NULLIF(trim(data->>'fecha_inscripcion'), ''),
        'telefonos', data->'telefonos',
        'ejecutivos', data->'ejecutivos',
        'historial_trabajadores', data->'historial_trabajadores',
        'historial_condiciones', data->'historial_condiciones',
        'historial_direcciones', data->'historial_direcciones',
        'establecimientos_anexos', data->'establecimientos_anexos',
        'comercio_exterior', NULLIF(trim(data->>'comercio_exterior'), ''),
        'referencia', NULLIF(trim(data->>'referencia'), ''),
        'proveedor_estado', CASE
          WHEN data->>'proveedor_estado' IN ('true', 'True', '1') THEN 'true'::jsonb
          WHEN data->>'proveedor_estado' IN ('false', 'False', '0') THEN 'false'::jsonb
          ELSE NULL
        END,
        'tier', NULLIF(trim(data->>'tier'), '')
      ))`;
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
