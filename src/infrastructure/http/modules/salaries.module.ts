import { Module } from '@nestjs/common';
import { SalariesController } from '../controllers/salaries.controller';
import { GetSalaryStatsUseCase, AddSalaryUseCase } from '../../../application/use-cases';
import { SalaryRepositoryImpl } from '../../persistence/repositories';
import { SALARY_REPOSITORY } from '../../../domain/repositories';

@Module({
  controllers: [SalariesController],
  providers: [
    GetSalaryStatsUseCase,
    AddSalaryUseCase,
    {
      provide: SALARY_REPOSITORY,
      useClass: SalaryRepositoryImpl,
    },
  ],
})
export class SalariesModule {}
