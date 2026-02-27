import { Review } from '../entities/review.entity';

export interface IReviewRepository {
  findByCompany(companyId: string): Promise<any[]>;
  findByCompanyWithUserVotes(companyId: string, profileId: string): Promise<any[]>;
  create(review: Partial<Review>): Promise<Review>;
  toggleVote(reviewId: string, profileId: string): Promise<{ voted: boolean; helpfulCount: number }>;
  delete(id: string, profileId: string): Promise<void>;
}

export const REVIEW_REPOSITORY = 'REVIEW_REPOSITORY';
