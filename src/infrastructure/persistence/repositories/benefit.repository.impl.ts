import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Benefit } from '../../../domain/entities/benefit.entity';
import { IBenefitRepository } from '../../../domain/repositories/benefit.repository';

@Injectable()
export class BenefitRepositoryImpl implements IBenefitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompany(companyId: string): Promise<Benefit[]> {
    const benefits = await this.prisma.benefit.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return benefits.map(this.toDomain);
  }

  async create(data: Partial<Benefit>): Promise<Benefit> {
    const benefit = await this.prisma.benefit.create({
      data: {
        companyId: data.companyId!,
        name: data.name!,
        category: data.category || null,
        description: data.description || null,
      },
    });
    return this.toDomain(benefit);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.benefit.delete({ where: { id } });
  }

  private toDomain(data: any): Benefit {
    return Benefit.create({
      id: data.id,
      companyId: data.companyId,
      name: data.name,
      category: data.category,
      description: data.description,
      createdAt: data.createdAt,
    });
  }
}
