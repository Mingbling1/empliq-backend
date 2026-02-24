// ============================================
// DOMAIN - Company Entity
// ============================================

export class Company {
  constructor(
    public readonly id: string,
    public readonly ruc: string | null,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly industry: string | null,
    public readonly employeeCount: number | null,
    public readonly location: string | null,
    public readonly website: string | null,
    public readonly logoUrl: string | null,
    public readonly foundedYear: number | null,
    public readonly isVerified: boolean,
    public readonly metadata: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: Partial<Company>): Company {
    return new Company(
      props.id || '',
      props.ruc || null,
      props.name || '',
      props.slug || '',
      props.description || null,
      props.industry || null,
      props.employeeCount || null,
      props.location || null,
      props.website || null,
      props.logoUrl || null,
      props.foundedYear || null,
      props.isVerified || false,
      props.metadata || {},
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }
}
