// ============================================
// APPLICATION - Use Cases: Get or Create Profile
// ============================================

import { Inject, Injectable } from '@nestjs/common';
import { Profile } from '../../domain/entities/profile.entity';
import { IProfileRepository, PROFILE_REPOSITORY } from '../../domain/repositories/profile.repository';

const AVATAR_OPTIONS = [
  '/illustrations/avatars/avatar_2094458_01.png',
  '/illustrations/avatars/avatar_2094458_02.png',
  '/illustrations/avatars/avatar_2094458_03.png',
  '/illustrations/avatars/avatar_2094458_04.png',
  '/illustrations/avatars/avatar_2094458_05.png',
  '/illustrations/avatars/avatar_2094458_06.png',
  '/illustrations/avatars/avatar_2094458_07.png',
  '/illustrations/avatars/avatar_2094458_08.png',
  '/illustrations/avatars/avatar_2094458_09.png',
  '/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_01.png',
  '/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_02.png',
  '/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_03.png',
  '/illustrations/avatars/avatar_Gemini_Generated_Image_vlmic5vlmic5vlmi_04.png',
  '/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_01.png',
  '/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_02.png',
  '/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_03.png',
  '/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_04.png',
  '/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_05.png',
  '/illustrations/avatars/avatar_people_communicating_various_ways_phone_call_laptop_chat_discussion_675502_1390_06.png',
  '/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_01.png',
  '/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_02.png',
  '/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_03.png',
  '/illustrations/avatars/avatar_women_emotions_monochrome_flat_linear_character_heads_set_151150_15217_04.png',
  '/illustrations/avatars/avatar_four_happy_women_portraits_black_white_1089355_401.png',
];

function getRandomAvatar(): string {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
}

// Discord-style nickname generator
const ADJECTIVES = [
  'Veloz', 'Audaz', 'Sabio', 'Noble', 'Astuto', 'Bravo', 'Calmo', 'Firme',
  'Genial', 'Hábil', 'Ágil', 'Justo', 'Líder', 'Tenaz', 'Vivaz', 'Digno',
  'Épico', 'Fiel', 'Grácil', 'Ideal', 'Lúcido', 'Magno', 'Nítido', 'Pleno',
  'Recto', 'Solar', 'Único', 'Vital', 'Zen', 'Claro', 'Sereno', 'Franco',
];

const NOUNS = [
  'Cóndor', 'Jaguar', 'Alpaca', 'Vicuña', 'Colibrí', 'Halcón', 'Puma',
  'Ciervo', 'Delfín', 'Búho', 'Lobo', 'Fénix', 'Dragón', 'León', 'Tigre',
  'Oso', 'Águila', 'Zorro', 'Gato', 'Tucán', 'Corcel', 'Lince', 'Mirlo',
  'Nutria', 'Quetzal', 'Cóndor', 'Coral', 'Llama', 'Rayo', 'Estrella',
];

function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${noun}${num}`;
}

export interface GetOrCreateProfileInput {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

@Injectable()
export class GetOrCreateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(input: GetOrCreateProfileInput): Promise<Profile> {
    // Check if profile already exists
    const existing = await this.profileRepository.findById(input.id);
    if (existing) {
      // Backfill nickname for profiles created before the nickname feature
      if (!existing.nickname) {
        return this.profileRepository.upsert(input.id, {
          nickname: generateNickname(),
        } as any);
      }
      return existing;
    }

    // New profile — assign random avatar and nickname
    return this.profileRepository.upsert(input.id, {
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl || getRandomAvatar(),
      nickname: generateNickname(),
    } as any);
  }
}
