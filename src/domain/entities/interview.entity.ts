// ============================================
// DOMAIN - Interview Entity
// ============================================

export class Interview {
  constructor(
    public readonly id: string,
    public readonly positionId: string,
    public readonly profileId: string, // Stored but not exposed publicly
    public readonly process: string | null,
    public readonly questions: string[],
    public readonly difficulty: string | null, // 'easy' | 'medium' | 'hard' | 'very_hard'
    public readonly duration: string | null,
    public readonly result: string | null,
    public readonly tips: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: Partial<Interview>): Interview {
    return new Interview(
      props.id || '',
      props.positionId || '',
      props.profileId || '',
      props.process || null,
      props.questions || [],
      props.difficulty || null,
      props.duration || null,
      props.result || null,
      props.tips || null,
      props.createdAt || new Date(),
    );
  }

  // Returns anonymous version for public display
  toAnonymous(): Omit<Interview, 'profileId'> {
    const { profileId, ...anonymous } = this;
    return anonymous as Omit<Interview, 'profileId'>;
  }
}
