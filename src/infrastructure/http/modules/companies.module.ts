import { Module } from '@nestjs/common';
import { CompaniesController } from '../controllers/companies.controller';
import {
  GetCompaniesUseCase,
  GetCompanyBySlugUseCase,
  CreateCompanyUseCase,
  UpdateCompanyUseCase,
} from '../../../application/use-cases';
import { CompanyRepositoryImpl } from '../../persistence/repositories';
import { COMPANY_REPOSITORY } from '../../../domain/repositories';

@Module({
  controllers: [CompaniesController],
  providers: [
    GetCompaniesUseCase,
    GetCompanyBySlugUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    {
      provide: COMPANY_REPOSITORY,
      useClass: CompanyRepositoryImpl,
    },
  ],
  exports: [COMPANY_REPOSITORY],
})
export class CompaniesModule {}
