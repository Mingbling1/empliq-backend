// ============================================
// APPLICATION - Use Cases: Sync Companies from Dev
// ============================================

import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ICompanyRepository,
  COMPANY_REPOSITORY,
  SyncResult,
} from '../../domain/repositories';

@Injectable()
export class SyncCompaniesUseCase {
  private readonly logger = new Logger(SyncCompaniesUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(mode: 'full' | 'delta'): Promise<SyncResult> {
    this.logger.log(`Sync started: mode=${mode}`);
    const result = await this.companyRepository.syncFromDev(mode);

    this.logger.log(
      `Sync complete: mode=${mode}, source=${result.sourceTotal}, ` +
        `created=${result.created}, updated=${result.updated}, ` +
        `logoUpdated=${result.logoUpdated}, unchanged=${result.unchanged}, ` +
        `duration=${result.durationMs}ms`,
    );

    return result;
  }
}
