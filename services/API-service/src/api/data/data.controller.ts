import { Get, Param, Controller, UseGuards } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOperation,
  ApiImplicitParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import {
  CountryMetaData,
  TriggeredArea,
  Aggregates,
  DisasterEvent,
} from './data.model';
import { DataService } from './data.service';
import { GeoJson } from './geo.model';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiUseTags('data')
@Controller()
export class DataController {
  private readonly dataService: DataService;

  public constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  @ApiOperation({ title: 'Get station location + trigger data' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'leadTime', required: true, type: 'string' })
  @Get('stations/:countryCode/:leadTime')
  public async getStations(@Param() params): Promise<GeoJson> {
    return await this.dataService.getStations(
      params.countryCode,
      params.leadTime,
    );
  }

  @ApiOperation({ title: 'Get Red Cross branch locations' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('red-cross-branches/:countryCode')
  public async getRedCrossBranches(@Param() params): Promise<GeoJson> {
    return await this.dataService.getRedCrossBranches(params.countryCode);
  }

  @ApiOperation({ title: 'Get metadata' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('metadata/:countryCode')
  public async getMetadata(@Param() params): Promise<CountryMetaData[]> {
    return await this.dataService.getMetadata(params.countryCode);
  }

  @ApiOperation({ title: 'Get recent dates' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('recent-dates/:countryCode')
  public async getRecentDate(@Param() params): Promise<number> {
    return await this.dataService.getRecentDates(params.countryCode);
  }

  @ApiOperation({ title: 'Get trigger data per lead-time' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('triggers/:countryCode')
  public async getTriggerPerLeadtime(@Param() params): Promise<number> {
    return await this.dataService.getTriggerPerLeadtime(params.countryCode);
  }

  @ApiOperation({ title: 'Get admin-area shape data' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiImplicitParam({ name: 'leadTime', required: true, type: 'string' })
  @Get('admin-area-data/:countryCode/:adminLevel/:leadTime')
  public async getAdminAreaData(@Param() params): Promise<GeoJson> {
    return await this.dataService.getAdminAreaData(
      params.countryCode,
      params.adminLevel,
      params.leadTime,
    );
  }

  @ApiOperation({ title: 'Get triggered areas' })
  @ApiImplicitParam({ name: 'event', required: true, type: 'number' })
  @Get('triggered-areas/:event')
  public async getTriggeredAreas(@Param() params): Promise<TriggeredArea[]> {
    return await this.dataService.getTriggeredAreas(params.event);
  }

  @ApiOperation({ title: 'Get matrix aggregates' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiImplicitParam({ name: 'leadTime', required: true, type: 'string' })
  @Get('matrix-aggregates/:countryCode/:adminLevel/:leadTime')
  public async getMatrixAggregates(@Param() params): Promise<Aggregates> {
    return await this.dataService.getMatrixAggregates(
      params.countryCode,
      params.adminLevel,
      params.leadTime,
    );
  }

  @ApiOperation({ title: 'Get active event' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('event/:countryCode')
  public async getEvent(@Param() params): Promise<DisasterEvent> {
    return await this.dataService.getEvent(params.countryCode);
  }
}
