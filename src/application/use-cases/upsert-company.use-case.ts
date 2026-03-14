// ============================================
// APPLICATION - Use Cases: Upsert Company
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Company } from '../../domain/entities';
import { ICompanyRepository, COMPANY_REPOSITORY } from '../../domain/repositories';

export interface UpsertCompanyInput {
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
export class UpsertCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(input: UpsertCompanyInput): Promise<Company> {
    const slug = input.slug || this.generateSlug(input.name, input.ruc);

    return this.companyRepository.upsertByRuc({
      ruc: input.ruc,
      name: input.name,
      slug,
      description: input.description,
      industry: input.industry,
      employeeCount: input.employeeCount,
      location: input.location,
      website: input.website,
      logoUrl: input.logoUrl,
      foundedYear: input.foundedYear,
      isVerified: input.isVerified,
      metadata: input.metadata,
    });
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

    // Append RUC suffix for uniqueness (same strategy as migrate_companies.py)
    return `${base}-${ruc}`;
  }
}
