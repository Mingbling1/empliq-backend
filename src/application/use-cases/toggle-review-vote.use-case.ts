// ============================================
// APPLICATION - Use Cases: Toggle Review Vote
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { IReviewRepository, REVIEW_REPOSITORY } from '../../domain/repositories/review.repository';

@Injectable()
export class ToggleReviewVoteUseCase {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(reviewId: string, profileId: string): Promise<{ voted: boolean; helpfulCount: number }> {
    return this.reviewRepository.toggleVote(reviewId, profileId);
  }
}
