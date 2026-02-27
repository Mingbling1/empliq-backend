// ============================================
// DOMAIN - Benefit Entity
// ============================================

export class Benefit {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly name: string,
    public readonly category: string | null,
    public readonly description: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: Partial<Benefit>): Benefit {
    return new Benefit(
      props.id || '',
      props.companyId || '',
      props.name || '',
      props.category || null,
      props.description || null,
      props.createdAt || new Date(),
    );
  }
}
