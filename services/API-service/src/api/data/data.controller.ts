import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { CountryMetaData, TriggeredArea, CountryEvent } from './data.model';
import { DataService } from './data.service';
import { GeoJson } from './geo.model';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('data')
@Controller()
export class DataController {
  private readonly dataService: DataService;

  public constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  @ApiOperation({ summary: 'Get station location + trigger data' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @Get('stations/:countryCode/:leadTime')
  public async getStations(@Param() params): Promise<GeoJson> {
    return await this.dataService.getStations(
      params.countryCode,
      params.leadTime,
    );
  }

  @ApiOperation({ summary: 'Get Red Cross branch locations' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('red-cross-branches/:countryCode')
  public async getRedCrossBranches(@Param() params): Promise<GeoJson> {
    return await this.dataService.getRedCrossBranches(params.countryCode);
  }

  @ApiOperation({ summary: 'Get metadata' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('metadata/:countryCode')
  public async getMetadata(@Param() params): Promise<CountryMetaData[]> {
    return await this.dataService.getMetadata(params.countryCode);
  }

  @ApiOperation({ summary: 'Get recent dates' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('recent-dates/:countryCode')
  public async getRecentDate(@Param() params): Promise<number> {
    return await this.dataService.getRecentDates(params.countryCode);
  }

  @ApiOperation({ summary: 'Get trigger data per lead-time' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('triggers/:countryCode')
  public async getTriggerPerLeadtime(@Param() params): Promise<number> {
    return await this.dataService.getTriggerPerLeadtime(params.countryCode);
  }

  @ApiOperation({ summary: 'Get admin-area shape data' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @Get('admin-area-data/:countryCode/:adminLevel/:leadTime')
  public async getAdminAreaData(@Param() params): Promise<GeoJson> {
    return await this.dataService.getAdminAreaData(
      params.countryCode,
      params.adminLevel,
      params.leadTime,
    );
  }

  @ApiOperation({ summary: 'Get triggered areas' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('triggered-areas/:countryCode')
  public async getTriggeredAreas(@Param() params): Promise<TriggeredArea[]> {
    return await this.dataService.getTriggeredAreas(params.countryCode);
  }

  @ApiOperation({ summary: 'Get active country event' })
  @ApiParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('event/:countryCode')
  public async getCountryEvent(@Param() params): Promise<CountryEvent> {
    return await this.dataService.getCountryEvent(params.countryCode);
  }
}
