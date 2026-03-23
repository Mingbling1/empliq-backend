import { Module } from '@nestjs/common';
import { SalariesController } from '../controllers/salaries.controller';
import { GetSalaryStatsUseCase, AddSalaryUseCase } from '../../../application/use-cases';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { SeedSalariesUseCase } from '../../../application/use-cases/seed-salaries.use-case';
import { SalaryRepositoryImpl } from '../../persistence/repositories';
import { ProfileRepositoryImpl } from '../../persistence/repositories/profile.repository.impl';
import { SALARY_REPOSITORY } from '../../../domain/repositories';
import { PROFILE_REPOSITORY } from '../../../domain/repositories/profile.repository';

@Module({
  controllers: [SalariesController],
  providers: [
    GetSalaryStatsUseCase,
    AddSalaryUseCase,
    GetOrCreateProfileUseCase,
    SeedSalariesUseCase,
    {
      provide: SALARY_REPOSITORY,
      useClass: SalaryRepositoryImpl,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },
  ],
})
export class SalariesModule {}
