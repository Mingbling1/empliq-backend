import { Salary, SalaryStats } from '../entities/salary.entity';

export interface ISalaryRepository {
  findByPosition(positionId: string): Promise<Salary[]>;
  getStatsByPosition(positionId: string): Promise<SalaryStats | null>;
  create(salary: Partial<Salary>): Promise<Salary>;
}

export const SALARY_REPOSITORY = 'SALARY_REPOSITORY';
