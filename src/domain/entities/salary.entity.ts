// ============================================
// DOMAIN - Salary Entity
// ============================================

export class Salary {
  constructor(
    public readonly id: string,
    public readonly positionId: string,
    public readonly profileId: string, // Stored but not exposed publicly
    public readonly amount: number,
    public readonly currency: string,
    public readonly period: string, // 'monthly' | 'annual'
    public readonly yearsExperience: number | null,
    public readonly isVerified: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(props: Partial<Salary>): Salary {
    return new Salary(
      props.id || '',
      props.positionId || '',
      props.profileId || '',
      props.amount || 0,
      props.currency || 'PEN',
      props.period || 'monthly',
      props.yearsExperience || null,
      props.isVerified || false,
      props.createdAt || new Date(),
    );
  }
}

// Value object for salary statistics (anonymous)
export class SalaryStats {
  constructor(
    public readonly positionId: string,
    public readonly count: number,
    public readonly average: number,
    public readonly min: number,
    public readonly max: number,
    public readonly median: number,
    public readonly currency: string,
  ) {}
}
