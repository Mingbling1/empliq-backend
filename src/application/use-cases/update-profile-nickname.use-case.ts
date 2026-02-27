// ============================================
// APPLICATION - Use Cases: Update Profile Nickname
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Profile } from '../../domain/entities/profile.entity';
import { IProfileRepository, PROFILE_REPOSITORY } from '../../domain/repositories/profile.repository';

export interface UpdateNicknameInput {
  profileId: string;
  nickname: string;
}

@Injectable()
export class UpdateProfileNicknameUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(input: UpdateNicknameInput): Promise<Profile> {
    return this.profileRepository.updateNickname(input.profileId, input.nickname);
  }
}
