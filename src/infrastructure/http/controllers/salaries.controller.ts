import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetSalaryStatsUseCase, AddSalaryUseCase } from '../../../application/use-cases';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

class AddSalaryDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'PEN';

  @IsString()
  @IsOptional()
  period?: string = 'monthly';

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;
}

@ApiTags('Salaries')
@Controller('positions/:positionId/salaries')
export class SalariesController {
  constructor(
    private readonly getSalaryStats: GetSalaryStatsUseCase,
    private readonly addSalary: AddSalaryUseCase,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get salary statistics (anonymous)' })
  async getStats(@Param('positionId') positionId: string) {
    return this.getSalaryStats.execute(positionId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add salary report (stored but displayed anonymously)' })
  async add(
    @Param('positionId') positionId: string,
    @Body() dto: AddSalaryDto,
  ) {
    // TODO: Get profileId from authenticated user (@CurrentUser)
    const profileId = 'temp-profile-id';
    return this.addSalary.execute({
      positionId,
      profileId,
      amount: dto.amount,
      currency: dto.currency || 'PEN',
      period: dto.period || 'monthly',
      yearsExperience: dto.yearsExperience,
    });
  }
}
