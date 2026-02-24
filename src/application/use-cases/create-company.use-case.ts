// ============================================
// APPLICATION - Use Cases: Create Company
// ============================================

import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { Company } from '../../domain/entities';
import { ICompanyRepository, COMPANY_REPOSITORY } from '../../domain/repositories';
import { StorageService } from '../../infrastructure/storage';

export interface CreateCompanyInput {
  name: string;
  slug?: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  logo?: {
    data: string; // base64
    fileName: string;
  };
}

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(input: CreateCompanyInput): Promise<Company> {
    // Generate slug from name if not provided
    const slug = input.slug || this.generateSlug(input.name);

    // Check if slug already exists
    const existing = await this.companyRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Company with slug "${slug}" already exists`);
    }

    // Upload logo if provided
    let logoUrl: string | undefined;
    if (input.logo?.data && input.logo?.fileName) {
      try {
        const uploadResult = await this.storageService.uploadLogo(
          input.logo.data,
          input.logo.fileName,
        );
        logoUrl = uploadResult.url;
      } catch (error) {
        // Log error but don't fail company creation
        console.error('Logo upload failed:', error);
      }
    }

    // Create company
    return this.companyRepository.create({
      name: input.name,
      slug,
      description: input.description,
      industry: input.industry,
      location: input.location,
      website: input.website,
      logoUrl,
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
