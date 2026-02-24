// ============================================
// DOMAIN - Position Entity
// ============================================

export class Position {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly categoryId: string | null,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly level: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: Partial<Position>): Position {
    return new Position(
      props.id || '',
      props.companyId || '',
      props.categoryId || null,
      props.title || '',
      props.slug || '',
      props.description || null,
      props.level || null,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }
}
