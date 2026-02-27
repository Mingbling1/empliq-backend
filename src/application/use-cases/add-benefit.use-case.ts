// ============================================
// APPLICATION - Use Cases: Add Benefit
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Benefit } from '../../domain/entities/benefit.entity';
import { IBenefitRepository, BENEFIT_REPOSITORY } from '../../domain/repositories/benefit.repository';

export interface AddBenefitInput {
  companyId: string;
  profileId: string;
  name: string;
  category?: string;
  description?: string;
}

@Injectable()
export class AddBenefitUseCase {
  constructor(
    @Inject(BENEFIT_REPOSITORY)
    private readonly benefitRepository: IBenefitRepository,
  ) {}

  async execute(input: AddBenefitInput): Promise<Benefit> {
    return this.benefitRepository.create({
      companyId: input.companyId,
      name: input.name,
      category: input.category || null,
      description: input.description || null,
    });
  }
}
