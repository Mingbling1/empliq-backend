import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Profile } from '../../../domain/entities/profile.entity';
import { IProfileRepository } from '../../../domain/repositories/profile.repository';

@Injectable()
export class ProfileRepositoryImpl implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (!profile) return null;
    return this.toDomain(profile);
  }

  async upsert(id: string, data: Partial<Profile>): Promise<Profile> {
    const profile = await this.prisma.profile.upsert({
      where: { id },
      create: {
        id,
        email: data.email ?? null,
        name: data.name ?? null,
        nickname: (data as any).nickname ?? null,
        avatarUrl: data.avatarUrl ?? null,
        role: data.role ?? 'user',
      },
      update: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...((data as any).nickname !== undefined && { nickname: (data as any).nickname }),
      },
    });
    return this.toDomain(profile);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<Profile> {
    const profile = await this.prisma.profile.update({
      where: { id },
      data: { avatarUrl },
    });
    return this.toDomain(profile);
  }

  async updateNickname(id: string, nickname: string): Promise<Profile> {
    const profile = await this.prisma.profile.update({
      where: { id },
      data: { nickname },
    });
    return this.toDomain(profile);
  }

  private toDomain(data: any): Profile {
    return new Profile(
      data.id,
      data.email,
      data.name,
      data.nickname,
      data.avatarUrl,
      data.role,
      data.createdAt,
      data.updatedAt,
    );
  }
}
