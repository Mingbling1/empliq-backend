import { Position } from '../entities/position.entity';

export interface IPositionRepository {
  findByCompany(companyId: string): Promise<Position[]>;
  findById(id: string): Promise<Position | null>;
  create(position: Partial<Position>): Promise<Position>;
  update(id: string, position: Partial<Position>): Promise<Position>;
  delete(id: string): Promise<void>;
}

export const POSITION_REPOSITORY = 'POSITION_REPOSITORY';
