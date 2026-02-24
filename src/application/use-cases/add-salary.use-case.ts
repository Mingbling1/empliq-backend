// ============================================
// APPLICATION - Use Cases: Add Salary (Anonymous)
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Salary } from '../../domain/entities';
import { ISalaryRepository, SALARY_REPOSITORY } from '../../domain/repositories';

export interface AddSalaryInput {
  positionId: string;
  profileId: string; // From authenticated user (Supabase auth.users.id)
  amount: number;
  currency: string;
  period: string;
  yearsExperience?: number;
}

@Injectable()
export class AddSalaryUseCase {
  constructor(
    @Inject(SALARY_REPOSITORY)
    private readonly salaryRepository: ISalaryRepository,
  ) {}

  async execute(input: AddSalaryInput): Promise<Salary> {
    return this.salaryRepository.create({
      positionId: input.positionId,
      profileId: input.profileId,
      amount: input.amount,
      currency: input.currency,
      period: input.period,
      yearsExperience: input.yearsExperience,
    });
  }
}
