import { Module } from '@nestjs/common';
import { StatsController } from '../controllers/stats.controller';
import { GetPlatformStatsUseCase } from '../../../application/use-cases';
import { StatsRepositoryImpl } from '../../persistence/repositories';
import { STATS_REPOSITORY } from '../../../domain/repositories/stats.repository';

@Module({
  controllers: [StatsController],
  providers: [
    GetPlatformStatsUseCase,
    {
      provide: STATS_REPOSITORY,
      useClass: StatsRepositoryImpl,
    },
  ],
})
export class StatsModule {}
