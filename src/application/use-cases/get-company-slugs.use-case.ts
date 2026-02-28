import { Inject, Injectable } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY, CompanySlug } from '../../domain/repositories';

@Injectable()
export class GetCompanySlugsUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(): Promise<CompanySlug[]> {
    return this.companyRepository.findAllSlugs();
  }
}
