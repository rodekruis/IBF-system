import { RolesGuard } from '../roles.guard';
import { Get, Post, Body, Param, Controller, UseGuards } from '@nestjs/common';
import { DataService } from './data.service';

import {
  ApiUseTags,
  ApiBearerAuth,
  ApiOperation,
  ApiImplicitParam,
} from '@nestjs/swagger';
import { User } from '../user/user.decorator';

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
}
