import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Response } from 'express';
import { FeatureCollection } from 'geojson';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { AggregateDataRecord } from '../../shared/data.model';
import { AdminLevel } from '../country/admin-level.enum';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { AdminAreaService } from './admin-area.service';
import {
  AdminAreaParams,
  EventAdminAreaParams,
  EventAdminAreaQuery,
} from './dto/admin-area.dto';
import { AdminAreaUpdateResult } from './dto/admin-area.dto';
import { DeleteAdminAreasDto } from './dto/delete-admin-areas.dto';
import { AdminAreaUploadDto } from './dto/upload-admin-areas.dto';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('admin-areas')
@Controller('admin-areas')
export class AdminAreaController {
  public constructor(private readonly adminAreaService: AdminAreaService) {}

  @ApiOperation({ summary: 'Get admin areas for a country and admin level' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, enum: AdminLevel })
  @ApiResponse({
    status: 200,
    description:
      '[EXTERNALLY USED - PIPELINE] Admin areas GeoJSON FeatureCollection',
  })
  @Get(':countryCodeISO3/:adminLevel')
  public async getAdminAreas(
    @Param() { countryCodeISO3, adminLevel }: AdminAreaParams,
  ): Promise<FeatureCollection> {
    return await this.adminAreaService.getAdminAreas(
      countryCodeISO3,
      adminLevel,
    );
  }

  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Adds or updates (if existing) admin-areas' })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiQuery({
    name: 'reset',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description:
      'IMPORTANT: Set to true to remove all existing admin-areas for this country and admin-level before adding new ones. WARNING: This may remove event data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary of admin area changes',
    type: [AdminAreaUpdateResult],
  })
  @Post(':countryCodeISO3/:adminLevel')
  @UseInterceptors()
  public async addOrUpdateAdminAreas(
    @Param() params: AdminAreaParams,
    @Body() body: AdminAreaUploadDto,
    @Query('reset', new ParseBoolPipe({ optional: true }))
    reset: boolean,
    @Res() res: Response,
  ) {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const result = await this.adminAreaService.addOrUpdateAdminAreas(
      params.countryCodeISO3,
      params.adminLevel,
      body.adminAreaGeoJson,
      reset,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Delete set of admin-areas. WARNING: This may remove event data.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiResponse({ status: 200, description: 'Admin areas deleted' })
  @Delete(':countryCodeISO3/:adminLevel')
  @UseInterceptors()
  public async deleteAdminAreas(
    @Param() params: AdminAreaParams,
    @Body() body: DeleteAdminAreasDto,
    @Res() res: Response,
  ) {
    if (body.secret !== process.env.RESET_SECRET) {
      return res.status(HttpStatus.FORBIDDEN).send('Not allowed');
    }

    const result = await this.adminAreaService.deleteAdminAreas(
      params.countryCodeISO3,
      params.adminLevel,
      body.placeCodes,
    );

    return res.status(HttpStatus.ACCEPTED).send(result);
  }

  @ApiOperation({
    summary:
      'Get event admin areas for a country, disaster type, and admin level',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiQuery({ name: 'leadTime', required: false, type: 'string' })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiQuery({ name: 'placeCodeParent', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Event admin areas GeoJSON FeatureCollection',
  })
  @Get(':countryCodeISO3/:disasterType/:adminLevel')
  public async getEventAdminAreas(
    @Param() params: EventAdminAreaParams,
    @Query() query: Partial<EventAdminAreaQuery>,
  ): Promise<FeatureCollection> {
    return await this.adminAreaService.getEventAdminAreas(
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
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
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
    @Param() params: EventAdminAreaParams,
    @Query() query: Partial<EventAdminAreaQuery>,
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
