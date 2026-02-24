// ============================================
// APPLICATION - Use Cases: Update Company
// ============================================

import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Company } from '../../domain/entities';
import { ICompanyRepository, COMPANY_REPOSITORY } from '../../domain/repositories';
import { StorageService } from '../../infrastructure/storage';

export interface UpdateCompanyInput {
  name?: string;
  slug?: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  logo?: {
    data: string; // base64
    fileName: string;
  };
  removeLogo?: boolean;
}

interface CompanyUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  logoUrl?: string | null;
}

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(id: string, input: UpdateCompanyInput): Promise<Company> {
    // Find existing company
    const existing = await this.companyRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Company with id "${id}" not found`);
    }

    // If changing slug, verify it doesn't conflict
    if (input.slug && input.slug !== existing.slug) {
      const slugExists = await this.companyRepository.findBySlug(input.slug);
      if (slugExists) {
        throw new ConflictException(`Company with slug "${input.slug}" already exists`);
      }
    }

    // Handle logo changes
    let newLogoUrl: string | null | undefined = undefined; // undefined = no change

    if (input.removeLogo && existing.logoUrl) {
      // Delete old logo from storage
      try {
        await this.storageService.deleteFile(existing.logoUrl);
      } catch (error) {
        console.error('Failed to delete old logo:', error);
      }
      newLogoUrl = null; // Set to null to remove
    } else if (input.logo?.data && input.logo?.fileName) {
      // Delete old logo if exists
      if (existing.logoUrl) {
        try {
          await this.storageService.deleteFile(existing.logoUrl);
        } catch (error) {
          console.error('Failed to delete old logo:', error);
        }
      }

      // Upload new logo
      try {
        const uploadResult = await this.storageService.uploadLogo(
          input.logo.data,
          input.logo.fileName,
        );
        newLogoUrl = uploadResult.url;
      } catch (error) {
        console.error('Logo upload failed:', error);
        throw error; // Re-throw for update - user expects logo change
      }
    }

    // Build update data object
    const updateData: CompanyUpdateData = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.industry !== undefined && { industry: input.industry }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.website !== undefined && { website: input.website }),
      ...(newLogoUrl !== undefined && { logoUrl: newLogoUrl }),
    };

    return this.companyRepository.update(id, updateData);
  }
}
