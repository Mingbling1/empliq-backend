import { Salary, SalaryStats } from '../entities/salary.entity';

export interface ISalaryRepository {
  findByPosition(positionId: string): Promise<Salary[]>;
  getStatsByPosition(positionId: string): Promise<SalaryStats | null>;
  /// Batch variant used by the positions endpoint to embed stats without N+1 queries.
  /// Returns a map keyed by positionId; positions with no salaries are omitted.
  getStatsForPositions(positionIds: string[]): Promise<Map<string, SalaryStats>>;
  create(salary: Partial<Salary>): Promise<Salary>;
}

export const SALARY_REPOSITORY = 'SALARY_REPOSITORY';
