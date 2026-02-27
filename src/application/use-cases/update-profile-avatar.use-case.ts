// ============================================
// APPLICATION - Use Cases: Update Profile Avatar
// ============================================

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '../../domain/entities/profile.entity';
import { IProfileRepository, PROFILE_REPOSITORY } from '../../domain/repositories/profile.repository';

export interface UpdateProfileAvatarInput {
  profileId: string;
  avatarUrl: string;
}

@Injectable()
export class UpdateProfileAvatarUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(input: UpdateProfileAvatarInput): Promise<Profile> {
    const existing = await this.profileRepository.findById(input.profileId);
    if (!existing) {
      throw new NotFoundException('Perfil no encontrado');
    }
    return this.profileRepository.updateAvatar(input.profileId, input.avatarUrl);
  }
}
