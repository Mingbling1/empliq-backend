import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Review } from '../../../domain/entities/review.entity';
import { IReviewRepository } from '../../../domain/repositories/review.repository';

@Injectable()
export class ReviewRepositoryImpl implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompany(companyId: string): Promise<any[]> {
    const reviews = await this.prisma.review.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: {
            nickname: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });
    return reviews.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      positionId: r.positionId,
      profileId: r.profileId,
      rating: r.rating,
      title: r.title,
      pros: r.pros,
      cons: r.cons,
      isCurrentEmployee: r.isCurrentEmployee,
      isVerified: r.isVerified,
      helpfulCount: r._count.votes,
      authorNickname: r.profile?.nickname || null,
      authorAvatarUrl: r.profile?.avatarUrl || null,
      createdAt: r.createdAt,
    }));
  }

  async findByCompanyWithUserVotes(companyId: string, profileId: string): Promise<any[]> {
    const reviews = await this.prisma.review.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: {
            nickname: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { votes: true },
        },
        votes: {
          where: { profileId },
          select: { id: true },
        },
      },
    });
    return reviews.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      positionId: r.positionId,
      profileId: r.profileId,
      rating: r.rating,
      title: r.title,
      pros: r.pros,
      cons: r.cons,
      isCurrentEmployee: r.isCurrentEmployee,
      isVerified: r.isVerified,
      helpfulCount: r._count.votes,
      hasVoted: r.votes.length > 0,
      authorNickname: r.profile?.nickname || null,
      authorAvatarUrl: r.profile?.avatarUrl || null,
      createdAt: r.createdAt,
    }));
  }

  async create(data: Partial<Review>): Promise<Review> {
    const review = await this.prisma.review.create({
      data: {
        companyId: data.companyId!,
        positionId: data.positionId || null,
        profileId: data.profileId!,
        rating: data.rating!,
        title: data.title || null,
        pros: data.pros || null,
        cons: data.cons || null,
        isCurrentEmployee: data.isCurrentEmployee || false,
      },
    });
    return this.toDomain(review);
  }

  async toggleVote(reviewId: string, profileId: string): Promise<{ voted: boolean; helpfulCount: number }> {
    const existing = await this.prisma.reviewVote.findUnique({
      where: { reviewId_profileId: { reviewId, profileId } },
    });

    if (existing) {
      await this.prisma.reviewVote.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.reviewVote.create({
        data: { reviewId, profileId },
      });
    }

    const helpfulCount = await this.prisma.reviewVote.count({ where: { reviewId } });
    return { voted: !existing, helpfulCount };
  }

  async delete(id: string, profileId: string): Promise<void> {
    await this.prisma.review.deleteMany({
      where: { id, profileId },
    });
  }

  private toDomain(data: any): Review {
    return Review.create({
      id: data.id,
      companyId: data.companyId,
      positionId: data.positionId,
      profileId: data.profileId,
      rating: data.rating,
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      isCurrentEmployee: data.isCurrentEmployee,
      isVerified: data.isVerified,
      createdAt: data.createdAt,
    });
  }
}
