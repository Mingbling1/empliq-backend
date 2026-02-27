import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { GetPositionsByCompanyUseCase } from '../../../application/use-cases';
import { CreatePositionUseCase } from '../../../application/use-cases/create-position.use-case';
import { SupabaseAuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

class CreatePositionDto {
  @IsString()
  companyId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}

@ApiTags('Positions')
@Controller()
export class PositionsController {
  constructor(
    private readonly getPositions: GetPositionsByCompanyUseCase,
    private readonly createPosition: CreatePositionUseCase,
  ) {}

  @Get('companies/:companyId/positions')
  @ApiOperation({ summary: 'Get positions by company' })
  async findByCompany(@Param('companyId') companyId: string) {
    return this.getPositions.execute(companyId);
  }

  @Post('positions')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new position' })
  async create(@Body() dto: CreatePositionDto, @CurrentUser() user: any) {
    return this.createPosition.execute({
      companyId: dto.companyId,
      title: dto.title,
      level: dto.level,
      categoryId: dto.categoryId,
    });
  }
}
