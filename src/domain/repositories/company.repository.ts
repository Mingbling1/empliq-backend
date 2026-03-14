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

export interface CompanySlug {
  slug: string;
  updatedAt: Date;
}

export interface UpsertCompanyData {
  ruc: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  employeeCount?: number;
  location?: string;
  website?: string;
  logoUrl?: string;
  foundedYear?: number;
  isVerified?: boolean;
  metadata?: Record<string, any>;
}

export interface BulkUpsertResult {
  total: number;
  created: number;
  updated: number;
  errors: Array<{ ruc: string; error: string }>;
}

export interface ICompanyRepository {
  findAll(options?: FindAllOptions): Promise<PaginatedResult<Company>>;
  findAllSlugs(): Promise<CompanySlug[]>;
  findById(id: string): Promise<Company | null>;
  findBySlug(slug: string): Promise<Company | null>;
  findByRuc(ruc: string): Promise<Company | null>;
  create(company: Partial<Company>): Promise<Company>;
  update(id: string, company: Partial<Company>): Promise<Company>;
  upsertByRuc(data: UpsertCompanyData): Promise<Company>;
  bulkUpsertByRuc(data: UpsertCompanyData[]): Promise<BulkUpsertResult>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Company[]>;
}

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';
