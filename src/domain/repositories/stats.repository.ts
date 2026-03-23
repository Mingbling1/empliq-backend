import { PlatformStats } from '../entities/platform-stats.entity';

export interface IStatsRepository {
  getPlatformStats(): Promise<PlatformStats>;
}

export const STATS_REPOSITORY = 'STATS_REPOSITORY';
