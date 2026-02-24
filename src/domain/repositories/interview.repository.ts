import { Interview } from '../entities/interview.entity';

export interface IInterviewRepository {
  findByPosition(positionId: string): Promise<Interview[]>;
  create(interview: Partial<Interview>): Promise<Interview>;
  delete(id: string, profileId: string): Promise<void>;
}

export const INTERVIEW_REPOSITORY = 'INTERVIEW_REPOSITORY';
