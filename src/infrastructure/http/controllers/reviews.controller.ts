import { Controller, Get, Post, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max, MinLength, MaxLength } from 'class-validator';
import { SupabaseAuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { GetReviewsByCompanyUseCase } from '../../../application/use-cases/get-reviews-by-company.use-case';
import { AddReviewUseCase } from '../../../application/use-cases/add-review.use-case';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { ToggleReviewVoteUseCase } from '../../../application/use-cases/toggle-review-vote.use-case';
import { SupabaseService } from '../../auth/auth';

class AddReviewDto {
  @IsString()
  companyId: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  pros?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  cons?: string;

  @IsBoolean()
  @IsOptional()
  isCurrentEmployee?: boolean;
}

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(
    private readonly getReviews: GetReviewsByCompanyUseCase,
    private readonly addReview: AddReviewUseCase,
    private readonly getOrCreateProfile: GetOrCreateProfileUseCase,
    private readonly toggleVote: ToggleReviewVoteUseCase,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('companies/:companyId/reviews')
  @ApiOperation({ summary: 'Get reviews by company (with optional user vote data)' })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    // Try to extract user from optional auth header for vote status
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const user = await this.supabaseService.getUser(token);
        if (user?.id) {
          return this.getReviews.executeWithVotes(companyId, user.id);
        }
      } catch {
        // Not authenticated, return without vote data
      }
    }
    return this.getReviews.execute(companyId);
  }

  @Post('reviews')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add review (stored but displayed anonymously)' })
  async add(@Body() dto: AddReviewDto, @CurrentUser() user: any) {
    // Ensure profile exists
    await this.getOrCreateProfile.execute({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
    });

    return this.addReview.execute({
      companyId: dto.companyId,
      positionId: dto.positionId,
      profileId: user.id,
      rating: dto.rating,
      title: dto.title,
      pros: dto.pros,
      cons: dto.cons,
      isCurrentEmployee: dto.isCurrentEmployee,
    });
  }

  @Post('reviews/:reviewId/vote')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle helpful vote on a review' })
  async vote(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: any,
  ) {
    // Ensure profile exists
    await this.getOrCreateProfile.execute({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
    });

    return this.toggleVote.execute(reviewId, user.id);
  }
}
