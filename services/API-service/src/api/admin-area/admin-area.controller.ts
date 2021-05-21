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

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('admin-areas')
@Controller('admin-areas')
export class AdminAreaController {
  private readonly adminAreaService: AdminAreaService;

  public constructor(adminAreaService: AdminAreaService) {
    this.adminAreaService = adminAreaService;
  }

  // NOTE: this endpoint is to be used by the IBF-pipeline to read this data from DB (instead of current way > TO DO)
  @ApiOperation({
    summary: 'Get admin-areas by country',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get(':countryCodeISO3')
  public async getAdminAreas(@Param() params): Promise<any[]> {
    return await this.adminAreaService.getAdminAreas(params.countryCodeISO3);
  }

  @ApiOperation({ summary: 'Get admin-area by leadTime' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'leadTime', required: false, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @Get('per-leadtime/:countryCodeISO3/:adminLevel/:leadTime?')
  public async getAdminAreaData(@Param() params): Promise<GeoJson> {
    return await this.adminAreaService.getAdminAreasPerLeadTime(
      params.countryCodeISO3,
      params.leadTime,
      params.adminLevel,
    );
  }

  @ApiOperation({
    summary: 'Get Glofas station to admin-area mapping by country',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @Get('station-mapping/:countryCodeISO3')
  public async getStationMapping(@Param() params): Promise<any[]> {
    return await this.adminAreaService.getStationAdminAreaMappingByCountry(
      params.countryCodeISO3,
    );
  }
}
