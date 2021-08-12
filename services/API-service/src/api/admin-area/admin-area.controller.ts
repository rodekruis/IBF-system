import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GeoJson } from '../../shared/geo.model';
import { RolesGuard } from '../../roles.guard';
import { AdminAreaService } from './admin-area.service';
import { AggregateDataRecord } from 'src/shared/data.model';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('admin-areas')
@Controller('admin-areas')
export class AdminAreaController {
  private readonly adminAreaService: AdminAreaService;

  public constructor(adminAreaService: AdminAreaService) {
    this.adminAreaService = adminAreaService;
  }

  @ApiOperation({
    summary: 'Get admin-areas by country raw',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get('raw/:countryCodeISO3')
  public async getAdminAreasRaw(@Param() params): Promise<any[]> {
    return await this.adminAreaService.getAdminAreasRaw(params.countryCodeISO3);
  }

  @ApiOperation({
    summary: 'Get admin-areas by country as geojson for dashboard',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: false, type: 'string' })
  @Get(':countryCodeISO3/:disasterType/:adminLevel/:leadTime?')
  public async getAdminAreas(@Param() params): Promise<GeoJson> {
    return await this.adminAreaService.getAdminAreas(
      params.countryCodeISO3,
      params.disasterType,
      params.leadTime,
      params.adminLevel,
    );
  }

  @ApiOperation({ summary: 'Get admin-area by leadTime' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: false, type: 'string' })
  @Get('aggregates/:countryCodeISO3/:disasterType/:adminLevel/:leadTime?')
  public async getAggregatesData(
    @Param() params,
  ): Promise<AggregateDataRecord[]> {
    return await this.adminAreaService.getAggregatesData(
      params.countryCodeISO3,
      params.disasterType,
      params.leadTime,
      params.adminLevel,
    );
  }
}
