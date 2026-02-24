// ============================================
// APPLICATION - Use Cases: Get All Companies
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY, FindAllOptions, PaginatedResult } from '../../domain/repositories';
import { Company } from '../../domain/entities';

@Injectable()
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(options?: FindAllOptions): Promise<PaginatedResult<Company>> {
    return this.companyRepository.findAll(options);
  }
}
