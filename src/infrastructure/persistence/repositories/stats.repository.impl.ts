import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IStatsRepository } from '../../../domain/repositories/stats.repository';
import { PlatformStats } from '../../../domain/entities/platform-stats.entity';

@Injectable()
export class StatsRepositoryImpl implements IStatsRepository {
  /** In-memory cache: stats + expiration timestamp */
  private cache: { data: PlatformStats; expiresAt: number } | null = null;

  /** Cache TTL: 1 hour (in milliseconds) */
  private readonly CACHE_TTL_MS = 60 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats(): Promise<PlatformStats> {
    // Return cached if still valid
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }

    // Run all counts in parallel
    const [companies, reviews, salaries, benefits, positions] =
      await Promise.all([
        this.prisma.company.count(),
        this.prisma.review.count(),
        this.prisma.salary.count(),
        this.prisma.benefit.count(),
        this.prisma.position.count(),
      ]);

    const stats: PlatformStats = {
      companies,
      reviews,
      salaries,
      benefits,
      positions,
      updatedAt: new Date(),
    };

    // Store in cache
    this.cache = {
      data: stats,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    };

    return stats;
  }
}
