import { Module } from '@nestjs/common';
import { ReviewsController } from '../controllers/reviews.controller';
import { GetReviewsByCompanyUseCase } from '../../../application/use-cases/get-reviews-by-company.use-case';
import { AddReviewUseCase } from '../../../application/use-cases/add-review.use-case';
import { ToggleReviewVoteUseCase } from '../../../application/use-cases/toggle-review-vote.use-case';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { ReviewRepositoryImpl } from '../../persistence/repositories/review.repository.impl';
import { REVIEW_REPOSITORY } from '../../../domain/repositories/review.repository';
import { ProfileRepositoryImpl } from '../../persistence/repositories/profile.repository.impl';
import { PROFILE_REPOSITORY } from '../../../domain/repositories/profile.repository';

@Module({
  controllers: [ReviewsController],
  providers: [
    GetReviewsByCompanyUseCase,
    AddReviewUseCase,
    ToggleReviewVoteUseCase,
    GetOrCreateProfileUseCase,
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewRepositoryImpl,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },
  ],
})
export class ReviewsModule {}
