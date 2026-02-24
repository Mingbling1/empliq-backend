import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Position } from '../../../domain/entities';
import { IPositionRepository } from '../../../domain/repositories';

@Injectable()
export class PositionRepositoryImpl implements IPositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompany(companyId: string): Promise<Position[]> {
    const positions = await this.prisma.position.findMany({
      where: { companyId },
      orderBy: { title: 'asc' },
    });
    return positions.map(this.toDomain);
  }

  async findById(id: string): Promise<Position | null> {
    const position = await this.prisma.position.findUnique({ where: { id } });
    return position ? this.toDomain(position) : null;
  }

  async create(data: Partial<Position>): Promise<Position> {
    const position = await this.prisma.position.create({
      data: {
        companyId: data.companyId!,
        categoryId: data.categoryId,
        title: data.title!,
        slug: data.slug!,
        description: data.description,
        level: data.level,
      },
    });
    return this.toDomain(position);
  }

  async update(id: string, data: Partial<Position>): Promise<Position> {
    const position = await this.prisma.position.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        categoryId: data.categoryId,
      },
    });
    return this.toDomain(position);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.position.delete({ where: { id } });
  }

  private toDomain(data: any): Position {
    return Position.create({
      id: data.id,
      companyId: data.companyId,
      categoryId: data.categoryId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      level: data.level,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
