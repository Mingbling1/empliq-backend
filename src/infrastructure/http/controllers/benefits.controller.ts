import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { SupabaseAuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { GetBenefitsByCompanyUseCase } from '../../../application/use-cases/get-benefits-by-company.use-case';
import { AddBenefitUseCase } from '../../../application/use-cases/add-benefit.use-case';
import { GetOrCreateProfileUseCase } from '../../../application/use-cases/get-or-create-profile.use-case';

class AddBenefitDto {
  @IsString()
  companyId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

@ApiTags('Benefits')
@Controller()
export class BenefitsController {
  constructor(
    private readonly getBenefits: GetBenefitsByCompanyUseCase,
    private readonly addBenefit: AddBenefitUseCase,
    private readonly getOrCreateProfile: GetOrCreateProfileUseCase,
  ) {}

  @Get('companies/:companyId/benefits')
  @ApiOperation({ summary: 'Get benefits by company' })
  async findByCompany(@Param('companyId') companyId: string) {
    return this.getBenefits.execute(companyId);
  }

  @Post('benefits')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add benefit report (authenticated)' })
  async add(@Body() dto: AddBenefitDto, @CurrentUser() user: any) {
    // Ensure profile exists
    await this.getOrCreateProfile.execute({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
    });

    return this.addBenefit.execute({
      companyId: dto.companyId,
      profileId: user.id,
      name: dto.name,
      category: dto.category,
      description: dto.description,
    });
  }
}
