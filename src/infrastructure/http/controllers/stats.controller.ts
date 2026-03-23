import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetPlatformStatsUseCase } from '../../../application/use-cases';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(
    private readonly getPlatformStats: GetPlatformStatsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get platform statistics (cached 1h)' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics with counts of companies, reviews, salaries, benefits, and positions',
  })
  async getStats() {
    return this.getPlatformStats.execute();
  }
}
