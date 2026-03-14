import { Module } from '@nestjs/common';
import { CompaniesController } from '../controllers/companies.controller';
import {
  GetCompaniesUseCase,
  GetCompanyBySlugUseCase,
  GetCompanySlugsUseCase,
  CreateCompanyUseCase,
  UpdateCompanyUseCase,
  UpsertCompanyUseCase,
  BulkUpsertCompaniesUseCase,
} from '../../../application/use-cases';
import { CompanyRepositoryImpl } from '../../persistence/repositories';
import { COMPANY_REPOSITORY } from '../../../domain/repositories';

@Module({
  controllers: [CompaniesController],
  providers: [
    GetCompaniesUseCase,
    GetCompanyBySlugUseCase,
    GetCompanySlugsUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    UpsertCompanyUseCase,
    BulkUpsertCompaniesUseCase,
    {
      provide: COMPANY_REPOSITORY,
      useClass: CompanyRepositoryImpl,
    },
  ],
  exports: [COMPANY_REPOSITORY],
})
export class CompaniesModule {}
