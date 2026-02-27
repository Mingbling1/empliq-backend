// ============================================
// APPLICATION - Use Cases: Create Position
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Position } from '../../domain/entities';
import { IPositionRepository, POSITION_REPOSITORY } from '../../domain/repositories';

export interface CreatePositionInput {
  companyId: string;
  title: string;
  level?: string;
  categoryId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CreatePositionUseCase {
  constructor(
    @Inject(POSITION_REPOSITORY)
    private readonly positionRepository: IPositionRepository,
  ) {}

  async execute(input: CreatePositionInput): Promise<Position> {
    const slug = slugify(input.title);

    return this.positionRepository.create({
      companyId: input.companyId,
      title: input.title,
      slug,
      level: input.level || null,
      categoryId: input.categoryId || null,
    });
  }
}
