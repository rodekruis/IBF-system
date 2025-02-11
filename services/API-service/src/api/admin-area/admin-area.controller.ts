import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { AggregateDataRecord } from '../../shared/data.model';
import { GeoJson } from '../../shared/geo.model';
import { countriesEnum } from '../country/country.enum';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { AdminAreaEntity } from './admin-area.entity';
import { AdminAreaService } from './admin-area.service';
import { EventAreaService } from './services/event-area.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('admin-areas')
@Controller('admin-areas')
export class AdminAreaController {
  public constructor(
    private readonly adminAreaService: AdminAreaService,
    private readonly eventAreaService: EventAreaService,
  ) {}

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Adds or updates (if existing) admin-areas' })
  @ApiParam({ name: 'countryCodeISO3', required: true, enum: countriesEnum })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated admin-areas.',
  })
  @Post('geojson/:countryCodeISO3/:adminLevel')
  @ApiConsumes()
  @UseInterceptors()
  public async addOrUpdateAdminAreas(
    @Param() params,
    @Body() adminAreaGeoJson: GeoJson,
  ): Promise<void> {
    await this.adminAreaService.addOrUpdateAdminAreas(
      params.countryCodeISO3,
      params.adminLevel,
      adminAreaGeoJson,
    );
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary:
      'Adds or updates (if existing) event-areas (currently Flash-floods only)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, enum: countriesEnum })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated admin-areas.',
  })
  @Post('event-areas/:countryCodeISO3/:disasterType')
  @ApiConsumes()
  @UseInterceptors()
  public async addOrUpdateEventAreas(
    @Param() params,
    @Body() adminAreaGeoJson: GeoJson,
  ): Promise<void> {
    await this.eventAreaService.addOrUpdateEventAreas(
      params.countryCodeISO3,
      params.disasterType,
      adminAreaGeoJson,
    );
  }

  @ApiOperation({
    summary:
      'Get admin-area boundaries and attributes for given country in raw format (used by IBF-pipelines)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, enum: countriesEnum })
  @ApiResponse({
    status: 200,
    description: 'Admin-area boundaries and attributes for given country',
    type: [AdminAreaEntity],
  })
  @Get('raw/:countryCodeISO3')
  public async getAdminAreasRaw(@Param() params) {
    return await this.adminAreaService.getAdminAreasRaw(params.countryCodeISO3);
  }

  @ApiOperation({
    summary:
      'Get (relevant) admin-areas boundaries and attributes for given country, disater-type and lead-time (as GeoJSON)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, enum: countriesEnum })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiQuery({ name: 'leadTime', required: false, type: 'string' })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiQuery({ name: 'placeCodeParent', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      '(Relevant) admin-areas boundaries and attributes for given country, disater-type and lead-time',
    type: GeoJson,
  })
  @Get(':countryCodeISO3/:disasterType/:adminLevel')
  public async getAdminAreas(
    @Param() params,
    @Query() query,
  ): Promise<GeoJson> {
    return await this.adminAreaService.getAdminAreas(
      params.countryCodeISO3,
      params.disasterType,
      params.adminLevel,
      query.leadTime,
      query.eventName,
      query.placeCodeParent,
    );
  }

  @ApiOperation({
    summary:
      'Get static and dynamic data per admin-area and indicator for given country, disaster-type, leadTime',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, enum: countriesEnum })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiQuery({ name: 'leadTime', required: false, type: 'string' })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiQuery({ name: 'placeCodeParent', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Static and dynamic data per admin-area and indicator for given country, disaster-type, leadTime',
    type: [AggregateDataRecord],
  })
  @Get('aggregates/:countryCodeISO3/:disasterType/:adminLevel')
  public async getAggregatesData(
    @Param() params,
    @Query() query,
  ): Promise<AggregateDataRecord[]> {
    return await this.adminAreaService.getAggregatesData(
      params.countryCodeISO3,
      params.disasterType,
      params.adminLevel,
      query.leadTime,
      query.eventName,
      query.placeCodeParent,
    );
  }
}
