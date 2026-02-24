// ============================================
// APPLICATION - Use Cases: Get Company By Slug
// ============================================

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Company } from '../../domain/entities';
import { ICompanyRepository, COMPANY_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetCompanyBySlugUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(slug: string): Promise<Company> {
    const company = await this.companyRepository.findBySlug(slug);
    if (!company) {
      throw new NotFoundException(`Company with slug "${slug}" not found`);
    }
    return company;
  }
}
