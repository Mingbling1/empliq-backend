import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiBody } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, IsArray, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { GetSalaryStatsUseCase, AddSalaryUseCase } from '../../../application/use-cases';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';
import { SeedSalariesUseCase } from '../../../application/use-cases/seed-salaries.use-case';
import { SupabaseAuthGuard } from '../../auth/auth.guard';
import { ApiKeyGuard } from '../../auth/api-key.guard';
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

class SeedSalaryItemDto {
  @IsString()
  companySlug: string;

  @IsString()
  positionTitle: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  period?: string;

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;

  @IsString()
  @IsOptional()
  source?: string;
}

class SeedSalariesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeedSalaryItemDto)
  @ArrayMaxSize(100)
  salaries: SeedSalaryItemDto[];
}

@ApiTags('Salaries')
@Controller()
export class SalariesController {
  constructor(
    private readonly getSalaryStats: GetSalaryStatsUseCase,
    private readonly addSalary: AddSalaryUseCase,
    private readonly getOrCreateProfile: GetOrCreateProfileUseCase,
    private readonly seedSalaries: SeedSalariesUseCase,
  ) {}

  @Get('positions/:positionId/salaries/stats')
  @ApiOperation({ summary: 'Get salary statistics (anonymous)' })
  async getStats(@Param('positionId') positionId: string) {
    return this.getSalaryStats.execute(positionId);
  }

  @Post('positions/:positionId/salaries')
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

  @Post('salaries/seed')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Seed salary data from external sources (admin, max 100 per request)',
    description:
      'Accepts an array of salary records with company slug and position title. ' +
      'Creates positions automatically if they don\'t exist. ' +
      'Links salaries to a system profile (not a real user).',
  })
  @ApiHeader({ name: 'x-api-key', description: 'Admin API key', required: true })
  @ApiBody({ type: SeedSalariesDto })
  async seed(@Body() dto: SeedSalariesDto) {
    return this.seedSalaries.execute(dto.salaries);
  }
}
