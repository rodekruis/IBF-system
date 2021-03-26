import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('glofasStations')
@Controller('glofasStations')
export class GlofasStationController {
  private readonly glofasStationService: GlofasStationService;

  public constructor(glofasStationService: GlofasStationService) {
    this.glofasStationService = glofasStationService;
  }

  // NOTE: this endpoint is to be used by the IBF-pipeline to read this data from DB (instead of current way > TO DO)
  @ApiOperation({ summary: 'Get Glofas stations by country' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get(':countryCode')
  public async getStations(@Param() params): Promise<GlofasStationEntity[]> {
    return await this.glofasStationService.getStationsByCountry(
      params.countryCode,
    );
  }
}
