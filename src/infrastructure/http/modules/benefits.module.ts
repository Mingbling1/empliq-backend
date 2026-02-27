import { Module } from '@nestjs/common';
import { BenefitsController } from '../controllers/benefits.controller';
import { GetBenefitsByCompanyUseCase } from '../../../application/use-cases/get-benefits-by-company.use-case';
import { AddBenefitUseCase } from '../../../application/use-cases/add-benefit.use-case';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { BenefitRepositoryImpl } from '../../persistence/repositories/benefit.repository.impl';
import { BENEFIT_REPOSITORY } from '../../../domain/repositories/benefit.repository';
import { ProfileRepositoryImpl } from '../../persistence/repositories/profile.repository.impl';
import { PROFILE_REPOSITORY } from '../../../domain/repositories/profile.repository';

@Module({
  controllers: [BenefitsController],
  providers: [
    GetBenefitsByCompanyUseCase,
    AddBenefitUseCase,
    GetOrCreateProfileUseCase,
    {
      provide: BENEFIT_REPOSITORY,
      useClass: BenefitRepositoryImpl,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },
  ],
})
export class BenefitsModule {}
