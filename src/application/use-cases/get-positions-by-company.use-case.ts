// ============================================
// APPLICATION - Use Cases: Get Positions By Company
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Position, SalaryStats } from '../../domain/entities';
import {
  IPositionRepository,
  POSITION_REPOSITORY,
  ISalaryRepository,
  SALARY_REPOSITORY,
} from '../../domain/repositories';

export interface PositionWithStats extends Position {
  salaryStats: SalaryStats | null;
}

@Injectable()
export class GetPositionsByCompanyUseCase {
  constructor(
    @Inject(POSITION_REPOSITORY)
    private readonly positionRepository: IPositionRepository,
    @Inject(SALARY_REPOSITORY)
    private readonly salaryRepository: ISalaryRepository,
  ) {}

  async execute(companyId: string): Promise<PositionWithStats[]> {
    const positions = await this.positionRepository.findByCompany(companyId);
    if (positions.length === 0) return [];

    const stats = await this.salaryRepository.getStatsForPositions(
      positions.map((p) => p.id),
    );

    return positions.map((p) => Object.assign(p, { salaryStats: stats.get(p.id) ?? null }));
  }
}
