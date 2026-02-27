// ============================================
// APPLICATION - Use Cases: Add Review
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Review } from '../../domain/entities/review.entity';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../domain/repositories/review.repository';

export interface AddReviewInput {
  companyId: string;
  positionId?: string;
  profileId: string;
  rating: number;
  title?: string;
  pros?: string;
  cons?: string;
  isCurrentEmployee?: boolean;
}

@Injectable()
export class AddReviewUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(input: AddReviewInput): Promise<Review> {
    return this.reviewRepository.create({
      companyId: input.companyId,
      positionId: input.positionId || null,
      profileId: input.profileId,
      rating: input.rating,
      title: input.title || null,
      pros: input.pros || null,
      cons: input.cons || null,
      isCurrentEmployee: input.isCurrentEmployee || false,
    });
  }
}
