import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { GeoJson } from '../../shared/geo.model';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('glofas-stations')
@Controller('glofas-stations')
export class GlofasStationController {
  private readonly glofasStationService: GlofasStationService;

  public constructor(glofasStationService: GlofasStationService) {
    this.glofasStationService = glofasStationService;
  }

  @ApiOperation({ summary: 'Get Glofas stations by country' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get(':countryCodeISO3')
  public async getStationsByCountry(
    @Param() params,
  ): Promise<GlofasStationEntity[]> {
    return await this.glofasStationService.getStationsByCountry(
      params.countryCodeISO3,
    );
  }

  @ApiOperation({
    summary: 'Get Glofas stations forecast by leadtime and country',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @Get(':countryCodeISO3/:leadTime')
  public async getStationForecastByLeadTime(@Param() params): Promise<GeoJson> {
    return await this.glofasStationService.getStationForecastByLeadTime(
      params.countryCodeISO3,
      params.leadTime,
    );
  }

  @ApiOperation({ summary: 'Upload Glofas forecast data per station' })
  @Post('triggers')
  public async uploadTriggerDataPerStation(
    @Body() uploadTriggerPerStation: UploadTriggerPerStationDto,
  ): Promise<GlofasStationForecastEntity[]> {
    return await this.glofasStationService.uploadTriggerDataPerStation(
      uploadTriggerPerStation,
    );
  }
}
