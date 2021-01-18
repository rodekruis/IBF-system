import { Get, Param, Controller, UseGuards } from '@nestjs/common';
import { DataService } from './data.service';

import {
  ApiUseTags,
  ApiOperation,
  ApiImplicitParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { GeoJson } from 'src/models/geo.model';
import { RolesGuard } from '../../roles.guard';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiUseTags('data')
@Controller()
export class DataController {
  private readonly dataService: DataService;

  public constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  @ApiOperation({ title: 'Get specific data table' })
  @ApiImplicitParam({ name: 'schemaName', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'tableName', required: true, type: 'string' })
  @Get('data/:schemaName/:tableName')
  public async getData(
    @User('id') userId: number,
    @Param() params,
  ): Promise<string> {
    return await this.dataService.getData(params.schemaName, params.tableName);
  }

  @ApiOperation({ title: 'Get specific geodata table' })
  @ApiImplicitParam({ name: 'schemaName', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'tableName', required: true, type: 'string' })
  @Get('geodata/:schemaName/:tableName')
  public async getGeodata(
    @User('id') userId: number,
    @Param() params,
  ): Promise<string> {
    return await this.dataService.getGeodata(
      params.schemaName,
      params.tableName,
    );
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

  @ApiOperation({ title: 'Get redcross branch locations' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('redcross-branches/:countryCode')
  public async getRedcrossBranches(@Param() params): Promise<GeoJson> {
    return await this.dataService.getRedcrossBranches(params.countryCode);
  }

  @ApiOperation({ title: 'Get metadata' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('metadata/:countryCode')
  public async getMetadata(@Param() params): Promise<GeoJson> {
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
  public async getTriggeredAreas(@Param() params): Promise<GeoJson> {
    return await this.dataService.getTriggeredAreas(params.event);
  }

  @ApiOperation({ title: 'Get matrix aggregates' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @ApiImplicitParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiImplicitParam({ name: 'leadTime', required: true, type: 'string' })
  @Get('matrix-aggregates/:countryCode/:adminLevel/:leadTime')
  public async getMatrixAggregates(@Param() params): Promise<GeoJson> {
    return await this.dataService.getMatrixAggregates(
      params.countryCode,
      params.adminLevel,
      params.leadTime,
    );
  }

  @ApiOperation({ title: 'Get active event' })
  @ApiImplicitParam({ name: 'countryCode', required: true, type: 'string' })
  @Get('event/:countryCode')
  public async getEvent(@Param() params): Promise<GeoJson> {
    return await this.dataService.getEvent(params.countryCode);
  }
}
