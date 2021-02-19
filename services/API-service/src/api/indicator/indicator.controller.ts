import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { IndicatorEntity } from './indicator.entity';
import { IndicatorService } from './indicator.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('indicators')
@Controller('indicators')
export class IndicatorController {
  private readonly indicatorService: IndicatorService;

  public constructor(indicatorService: IndicatorService) {
    this.indicatorService = indicatorService;
  }

  @ApiOperation({ summary: 'Get indicator data' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get(':countryCode')
  public async getIndicators(@Param() params): Promise<IndicatorEntity[]> {
    return await this.indicatorService.getIndicatorsByCountry(
      params.countryCode,
    );
  }
}
