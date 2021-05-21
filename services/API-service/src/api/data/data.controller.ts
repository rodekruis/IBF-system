import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';

import { TriggeredArea, EventSummaryCountry } from './data.model';
import { DataService } from './data.service';
import { GeoJson } from './geo.model';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('data')
@Controller('data')
export class DataController {
  private readonly dataService: DataService;

  public constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  @ApiOperation({ summary: 'Get Red Cross branch locations' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get('red-cross-branches/:countryCodeISO3')
  public async getRedCrossBranches(@Param() params): Promise<GeoJson> {
    return await this.dataService.getRedCrossBranches(params.countryCodeISO3);
  }

  @ApiOperation({ summary: 'Get recent dates' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get('recent-dates/:countryCodeISO3')
  public async getRecentDate(@Param() params): Promise<object> {
    return await this.dataService.getRecentDates(params.countryCodeISO3);
  }

  @ApiOperation({ summary: 'Get trigger data per lead-time' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get('triggers/:countryCodeISO3')
  public async getTriggerPerLeadtime(@Param() params): Promise<object> {
    return await this.dataService.getTriggerPerLeadtime(params.countryCodeISO3);
  }

  @ApiOperation({ summary: 'Get admin-area shape data' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: false, type: 'string' })
  @Get('admin-area-data/:countryCodeISO3/:adminLevel/:leadTime?')
  public async getAdminAreaData(@Param() params): Promise<GeoJson> {
    return await this.dataService.getAdminAreaData(
      params.countryCodeISO3,
      params.adminLevel,
      params.leadTime,
    );
  }

  @ApiOperation({ summary: 'Get triggered areas' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get('triggered-areas/:countryCodeISO3')
  public async getTriggeredAreas(@Param() params): Promise<TriggeredArea[]> {
    return await this.dataService.getTriggeredAreas(params.countryCodeISO3);
  }

  @ApiOperation({ summary: 'Get active event summary of a country' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get('event/:countryCodeISO3')
  public async getEventSummaryCountry(
    @Param() params,
  ): Promise<EventSummaryCountry> {
    return await this.dataService.getEventSummaryCountry(
      params.countryCodeISO3,
    );
  }
}
