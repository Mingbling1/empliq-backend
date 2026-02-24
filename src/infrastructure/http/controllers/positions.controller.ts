import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetPositionsByCompanyUseCase } from '../../../application/use-cases';

@ApiTags('Positions')
@Controller('companies/:companyId/positions')
export class PositionsController {
  constructor(private readonly getPositions: GetPositionsByCompanyUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get positions by company' })
  async findByCompany(@Param('companyId') companyId: string) {
    return this.getPositions.execute(companyId);
  }
}
