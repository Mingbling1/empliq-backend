// ============================================
// DOMAIN - Repository Interfaces (Ports)
// ============================================

import { Company } from '../entities/company.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  location?: string;
}

export interface ICompanyRepository {
  findAll(options?: FindAllOptions): Promise<PaginatedResult<Company>>;
  findById(id: string): Promise<Company | null>;
  findBySlug(slug: string): Promise<Company | null>;
  create(company: Partial<Company>): Promise<Company>;
  update(id: string, company: Partial<Company>): Promise<Company>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Company[]>;
}

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';
