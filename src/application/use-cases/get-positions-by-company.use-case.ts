// ============================================
// APPLICATION - Use Cases: Get Positions By Company
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Position } from '../../domain/entities';
import { IPositionRepository, POSITION_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetPositionsByCompanyUseCase {
  constructor(
    @Inject(POSITION_REPOSITORY)
    private readonly positionRepository: IPositionRepository,
  ) {}

  async execute(companyId: string): Promise<Position[]> {
    return this.positionRepository.findByCompany(companyId);
  }
}
