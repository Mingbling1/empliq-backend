// ============================================
// APPLICATION - Use Cases: Get Reviews by Company
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../domain/repositories/review.repository';

@Injectable()
export class GetReviewsByCompanyUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(companyId: string): Promise<any[]> {
    return this.reviewRepository.findByCompany(companyId);
  }

  async executeWithVotes(companyId: string, profileId: string): Promise<any[]> {
    return this.reviewRepository.findByCompanyWithUserVotes(companyId, profileId);
  }
}
