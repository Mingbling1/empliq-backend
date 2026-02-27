import { Module } from '@nestjs/common';
import { PositionsController } from '../controllers/positions.controller';
import { GetPositionsByCompanyUseCase } from '../../../application/use-cases';
import { CreatePositionUseCase } from '../../../application/use-cases/create-position.use-case';
import { PositionRepositoryImpl } from '../../persistence/repositories';
import { POSITION_REPOSITORY } from '../../../domain/repositories';

@Module({
  controllers: [PositionsController],
  providers: [
    GetPositionsByCompanyUseCase,
    CreatePositionUseCase,
    {
      provide: POSITION_REPOSITORY,
      useClass: PositionRepositoryImpl,
    },
  ],
  exports: [POSITION_REPOSITORY],
})
export class PositionsModule {}
