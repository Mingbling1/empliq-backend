import { Benefit } from '../entities/benefit.entity';

export interface IBenefitRepository {
  findByCompany(companyId: string): Promise<Benefit[]>;
  create(benefit: Partial<Benefit>): Promise<Benefit>;
  delete(id: string): Promise<void>;
}

export const BENEFIT_REPOSITORY = 'BENEFIT_REPOSITORY';
