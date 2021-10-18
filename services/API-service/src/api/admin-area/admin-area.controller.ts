import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GeoJson } from '../../shared/geo.model';
import { RolesGuard } from '../../roles.guard';
import { AdminAreaService } from './admin-area.service';
import { AggregateDataRecord } from '../../shared/data.model';
import { AdminAreaEntity } from './admin-area.entity';

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
    summary:
      'Get admin-area boundaries and attributes for given country in raw format (used by IBF-pipelines)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Admin-area boundaries and attributes for given country',
    type: [AdminAreaEntity],
  })
  @Get('raw/:countryCodeISO3')
  public async getAdminAreasRaw(@Param() params): Promise<any[]> {
    return await this.adminAreaService.getAdminAreasRaw(params.countryCodeISO3);
  }

  @ApiOperation({
    summary:
      'Get (relevant) admin-areas boundaries and attributes for given country, disater-type and lead-time (as GeoJSON)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      '(Relevant) admin-areas boundaries and attributes for given country, disater-type and lead-time',
    type: GeoJson,
  })
  @Get(':countryCodeISO3/:disasterType/:adminLevel/:leadTime?')
  public async getAdminAreas(@Param() params): Promise<GeoJson> {
    return await this.adminAreaService.getAdminAreas(
      params.countryCodeISO3,
      params.disasterType,
      params.leadTime,
      params.adminLevel,
    );
  }

  @ApiOperation({
    summary:
      'Get static and dynamic data per admin-area and indicator for given country, disaster-type, leadTime',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Static and dynamic data per admin-area and indicator for given country, disaster-type, leadTime',
    type: [AggregateDataRecord],
  })
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
