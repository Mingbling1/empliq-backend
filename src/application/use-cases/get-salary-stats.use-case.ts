// ============================================
// APPLICATION - Use Cases: Get Salary Stats
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { SalaryStats } from '../../domain/entities';
import { ISalaryRepository, SALARY_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetSalaryStatsUseCase {
  constructor(
    @Inject(SALARY_REPOSITORY)
    private readonly salaryRepository: ISalaryRepository,
  ) {}

  async execute(positionId: string): Promise<SalaryStats | null> {
    return this.salaryRepository.getStatsByPosition(positionId);
  }
}
