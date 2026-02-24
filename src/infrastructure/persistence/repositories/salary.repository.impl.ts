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
      select: { amount: true, currency: true },
    });

    if (salaries.length === 0) return null;

    const amounts = salaries.map((s) => Number(s.amount));
    const sorted = [...amounts].sort((a, b) => a - b);
    const sum = amounts.reduce((a, b) => a + b, 0);

    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return new SalaryStats(
      positionId,
      salaries.length,
      Math.round(sum / salaries.length),
      Math.min(...amounts),
      Math.max(...amounts),
      Math.round(median),
      salaries[0].currency,
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
