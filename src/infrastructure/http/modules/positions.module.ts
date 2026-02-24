import { Module } from '@nestjs/common';
import { PositionsController } from '../controllers/positions.controller';
import { GetPositionsByCompanyUseCase } from '../../../application/use-cases';
import { PositionRepositoryImpl } from '../../persistence/repositories';
import { POSITION_REPOSITORY } from '../../../domain/repositories';

@Module({
  controllers: [PositionsController],
  providers: [
    GetPositionsByCompanyUseCase,
    {
      provide: POSITION_REPOSITORY,
      useClass: PositionRepositoryImpl,
    },
  ],
  exports: [POSITION_REPOSITORY],
})
export class PositionsModule {}
