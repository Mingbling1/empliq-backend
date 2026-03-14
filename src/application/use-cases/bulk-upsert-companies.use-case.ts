// ============================================
// APPLICATION - Use Cases: Bulk Upsert Companies
// ============================================

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY, BulkUpsertResult } from '../../domain/repositories';

export interface BulkUpsertCompanyItem {
  ruc: string;
  name: string;
  slug?: string;
  description?: string;
  industry?: string;
  employeeCount?: number;
  location?: string;
  website?: string;
  logoUrl?: string;
  foundedYear?: number;
  isVerified?: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class BulkUpsertCompaniesUseCase {
  private readonly logger = new Logger(BulkUpsertCompaniesUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(items: BulkUpsertCompanyItem[]): Promise<BulkUpsertResult> {
    this.logger.log(`Bulk upsert: processing ${items.length} companies`);

    // Generate slugs for items that don't have one
    const prepared = items.map((item) => ({
      ...item,
      slug: item.slug || this.generateSlug(item.name, item.ruc),
      metadata: item.metadata ?? {},
      isVerified: item.isVerified ?? false,
    }));

    const result = await this.companyRepository.bulkUpsertByRuc(prepared);

    this.logger.log(
      `Bulk upsert complete: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
    );

    return result;
  }

  private generateSlug(name: string, ruc: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${base}-${ruc}`;
  }
}
