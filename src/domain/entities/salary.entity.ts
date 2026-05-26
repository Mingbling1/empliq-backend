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

export type SalarySourceType = 'USER_REPORTED' | 'AI_EXTRACTED' | 'IMPORTED';

/// How many salary records came from each source. Drives the badge shown in the UI.
export interface SourceBreakdown {
  USER_REPORTED: number;
  AI_EXTRACTED: number;
  IMPORTED: number;
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
    public readonly sourceBreakdown: SourceBreakdown,
    /// The single most representative source for this position. Used for the badge.
    /// Null when the position has zero salary records.
    public readonly dominantSource: SalarySourceType | null,
    /// Origin metadata. Populated only when every record shares the same source —
    /// otherwise null, and the UI falls back to the breakdown view.
    public readonly sourceName: string | null,
    public readonly sourceUrl: string | null,
    public readonly extractedAt: Date | null,
  ) {}
}
