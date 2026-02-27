// ============================================
// DOMAIN - Review Entity
// ============================================

export class Review {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly positionId: string | null,
    public readonly profileId: string,
    public readonly rating: number,
    public readonly title: string | null,
    public readonly pros: string | null,
    public readonly cons: string | null,
    public readonly isCurrentEmployee: boolean,
    public readonly isVerified: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(props: Partial<Review>): Review {
    return new Review(
      props.id || '',
      props.companyId || '',
      props.positionId || null,
      props.profileId || '',
      props.rating || 0,
      props.title || null,
      props.pros || null,
      props.cons || null,
      props.isCurrentEmployee || false,
      props.isVerified || false,
      props.createdAt || new Date(),
    );
  }
}
