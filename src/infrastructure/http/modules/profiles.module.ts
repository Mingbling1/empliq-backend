import { Module } from '@nestjs/common';
import { ProfilesController } from '../controllers/profiles.controller';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { UpdateProfileAvatarUseCase } from '../../../application/use-cases/update-profile-avatar.use-case';
import { UpdateProfileNicknameUseCase } from '../../../application/use-cases/update-profile-nickname.use-case';
import { ProfileRepositoryImpl } from '../../persistence/repositories/profile.repository.impl';
import { PROFILE_REPOSITORY } from '../../../domain/repositories/profile.repository';

@Module({
  controllers: [ProfilesController],
  providers: [
    GetOrCreateProfileUseCase,
    UpdateProfileAvatarUseCase,
    UpdateProfileNicknameUseCase,
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepositoryImpl,
    },
  ],
  exports: [PROFILE_REPOSITORY],
})
export class ProfilesModule {}
