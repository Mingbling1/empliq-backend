import { Profile } from '../entities/profile.entity';

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  upsert(id: string, data: Partial<Profile>): Promise<Profile>;
  updateAvatar(id: string, avatarUrl: string): Promise<Profile>;
  updateNickname(id: string, nickname: string): Promise<Profile>;
}

export const PROFILE_REPOSITORY = 'PROFILE_REPOSITORY';
