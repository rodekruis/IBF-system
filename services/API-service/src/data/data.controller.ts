import { Get, Param, Controller } from '@nestjs/common';
import { DataService } from './data.service';

import { ApiUseTags, ApiOperation, ApiImplicitParam } from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { Station, GeoJson } from 'src/models/station.model';

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
  public async getStations(
    @User('id') userId: number,
    @Param() params,
  ): Promise<GeoJson> {
    return await this.dataService.getStations(
      params.countryCode,
      params.leadTime,
    );
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
}
