import { Inject, Injectable } from '@nestjs/common';
import { PlatformStats } from '../../domain/entities/platform-stats.entity';
import { IStatsRepository, STATS_REPOSITORY } from '../../domain/repositories/stats.repository';

@Injectable()
export class GetPlatformStatsUseCase {
  constructor(
    @Inject(STATS_REPOSITORY)
    private readonly statsRepository: IStatsRepository,
  ) {}

  async execute(): Promise<PlatformStats> {
    return this.statsRepository.getPlatformStats();
  }
}
