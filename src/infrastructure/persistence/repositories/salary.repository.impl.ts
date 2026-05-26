import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Salary, SalaryStats } from '../../../domain/entities';
import { ISalaryRepository } from '../../../domain/repositories';

@Injectable()
export class SalaryRepositoryImpl implements ISalaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPosition(positionId: string): Promise<Salary[]> {
    const salaries = await this.prisma.salary.findMany({
      where: { positionId },
      orderBy: { createdAt: 'desc' },
    });
    return salaries.map(this.toDomain);
  }

  async getStatsByPosition(positionId: string): Promise<SalaryStats | null> {
    const salaries = await this.prisma.salary.findMany({
      where: { positionId },
      select: {
        amount: true,
        currency: true,
        sourceType: true,
        sourceName: true,
        sourceUrl: true,
        extractedAt: true,
      },
    });

    if (salaries.length === 0) return null;

    const amounts = salaries.map((s) => Number(s.amount));
    const sorted = [...amounts].sort((a, b) => a - b);
    const sum = amounts.reduce((a, b) => a + b, 0);

    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    const sourceBreakdown = { USER_REPORTED: 0, AI_EXTRACTED: 0, IMPORTED: 0 };
    for (const s of salaries) {
      const t = (s.sourceType ?? 'USER_REPORTED') as keyof typeof sourceBreakdown;
      sourceBreakdown[t] = (sourceBreakdown[t] ?? 0) + 1;
    }
    // USER_REPORTED wins ties because it's the most trustworthy signal (current employee).
    const ranked: Array<keyof typeof sourceBreakdown> = ['USER_REPORTED', 'AI_EXTRACTED', 'IMPORTED'];
    let dominantSource = ranked[0];
    let maxCount = sourceBreakdown[dominantSource];
    for (const t of ranked.slice(1)) {
      if (sourceBreakdown[t] > maxCount) {
        dominantSource = t;
        maxCount = sourceBreakdown[t];
      }
    }

    // Origin metadata is exposed only when every record agrees on (sourceName, sourceUrl).
    // For mixed data we omit it; the UI shows the breakdown instead.
    const uniqueSourceNames = new Set(salaries.map((s) => s.sourceName ?? ''));
    const uniqueSourceUrls = new Set(salaries.map((s) => s.sourceUrl ?? ''));
    const sourceName = uniqueSourceNames.size === 1 ? salaries[0].sourceName : null;
    const sourceUrl = uniqueSourceUrls.size === 1 ? salaries[0].sourceUrl : null;
    // Newest extractedAt — most useful date to show.
    const extractedAt = salaries.reduce<Date | null>((latest, s) => {
      if (!s.extractedAt) return latest;
      return latest && latest > s.extractedAt ? latest : s.extractedAt;
    }, null);

    return new SalaryStats(
      positionId,
      salaries.length,
      Math.round(sum / salaries.length),
      Math.min(...amounts),
      Math.max(...amounts),
      Math.round(median),
      salaries[0].currency,
      sourceBreakdown,
      dominantSource,
      sourceName,
      sourceUrl,
      extractedAt,
    );
  }

  async create(data: Partial<Salary>): Promise<Salary> {
    const salary = await this.prisma.salary.create({
      data: {
        positionId: data.positionId!,
        profileId: data.profileId!,
        amount: data.amount!,
        currency: data.currency || 'MXN',
        period: data.period || 'monthly',
        yearsExperience: data.yearsExperience,
      },
    });
    return this.toDomain(salary);
  }

  private toDomain(data: any): Salary {
    return Salary.create({
      id: data.id,
      positionId: data.positionId,
      profileId: data.profileId,
      amount: Number(data.amount),
      currency: data.currency,
      period: data.period,
      yearsExperience: data.yearsExperience,
      isVerified: data.isVerified,
      createdAt: data.createdAt,
    });
  }
}
