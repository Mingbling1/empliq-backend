import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

export interface SeedSalaryItem {
  companySlug: string;
  positionTitle: string;
  level?: string;
  amount: number;
  currency?: string;
  period?: string;
  yearsExperience?: number;
  source?: string;
}

export interface SeedSalaryResult {
  total: number;
  created: number;
  skipped: number;
  errors: Array<{ index: number; companySlug: string; positionTitle: string; error: string }>;
}

/** System profile ID used for seeded data (not a real user) */
const SYSTEM_PROFILE_ID = '00000000-0000-0000-0000-000000000000';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class SeedSalariesUseCase {
  private readonly logger = new Logger(SeedSalariesUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(items: SeedSalaryItem[]): Promise<SeedSalaryResult> {
    const result: SeedSalaryResult = {
      total: items.length,
      created: 0,
      skipped: 0,
      errors: [],
    };

    // Ensure system profile exists (upsert)
    await this.prisma.profile.upsert({
      where: { id: SYSTEM_PROFILE_ID },
      update: {},
      create: {
        id: SYSTEM_PROFILE_ID,
        email: 'system@empliq.io',
        name: 'Empliq System',
        nickname: 'empliq-system',
        role: 'system',
      },
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        // 1. Find company by slug
        const company = await this.prisma.company.findUnique({
          where: { slug: item.companySlug },
          select: { id: true },
        });

        if (!company) {
          result.errors.push({
            index: i,
            companySlug: item.companySlug,
            positionTitle: item.positionTitle,
            error: `Company not found: ${item.companySlug}`,
          });
          continue;
        }

        // 2. Upsert position (find by companyId + slug, create if not exists)
        const positionSlug = slugify(item.positionTitle);
        let position = await this.prisma.position.findUnique({
          where: {
            companyId_slug: {
              companyId: company.id,
              slug: positionSlug,
            },
          },
          select: { id: true },
        });

        if (!position) {
          position = await this.prisma.position.create({
            data: {
              companyId: company.id,
              title: item.positionTitle,
              slug: positionSlug,
              level: item.level || null,
            },
            select: { id: true },
          });
        }

        // 3. Create salary record
        await this.prisma.salary.create({
          data: {
            positionId: position.id,
            profileId: SYSTEM_PROFILE_ID,
            amount: item.amount,
            currency: item.currency || 'PEN',
            period: item.period || 'monthly',
            yearsExperience: item.yearsExperience || null,
            isVerified: false,
          },
        });

        result.created++;
      } catch (err: any) {
        this.logger.warn(`Failed to seed salary [${i}]: ${err.message}`);
        result.errors.push({
          index: i,
          companySlug: item.companySlug,
          positionTitle: item.positionTitle,
          error: err.message,
        });
      }
    }

    result.skipped = result.total - result.created - result.errors.length;

    this.logger.log(
      `Seed complete: ${result.created} created, ${result.errors.length} errors out of ${result.total}`,
    );

    return result;
  }
}
