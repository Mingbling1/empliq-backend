// ============================================
// APPLICATION - Use Cases: Get Benefits by Company
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Benefit } from '../../domain/entities/benefit.entity';
import { IBenefitRepository, BENEFIT_REPOSITORY } from '../../domain/repositories/benefit.repository';

@Injectable()
export class GetBenefitsByCompanyUseCase {
  constructor(
    @Inject(BENEFIT_REPOSITORY)
    private readonly benefitRepository: IBenefitRepository,
  ) {}

  async execute(companyId: string): Promise<Benefit[]> {
    return this.benefitRepository.findByCompany(companyId);
  }
}
