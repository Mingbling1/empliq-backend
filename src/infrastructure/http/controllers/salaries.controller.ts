import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetSalaryStatsUseCase, AddSalaryUseCase } from '../../../application/use-cases';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { SupabaseAuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

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
    private readonly getOrCreateProfile: GetOrCreateProfileUseCase,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get salary statistics (anonymous)' })
  async getStats(@Param('positionId') positionId: string) {
    return this.getSalaryStats.execute(positionId);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add salary report (stored but displayed anonymously)' })
  async add(
    @Param('positionId') positionId: string,
    @Body() dto: AddSalaryDto,
    @CurrentUser() user: any,
  ) {
    // Ensure profile exists before creating salary
    await this.getOrCreateProfile.execute({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
    });

    return this.addSalary.execute({
      positionId,
      profileId: user.id,
      amount: dto.amount,
      currency: dto.currency || 'PEN',
      period: dto.period || 'monthly',
      yearsExperience: dto.yearsExperience,
    });
  }
}
