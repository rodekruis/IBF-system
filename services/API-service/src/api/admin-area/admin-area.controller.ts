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

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { AggregateDataRecord } from '../../shared/data.model';
import { GeoJson } from '../../shared/geo.model';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { AdminAreaService } from './admin-area.service';
import { AdminAreaParams } from './dto/admin-area.dto';
import { DeleteAdminAreasDto } from './dto/delete-admin-areas.dto';
import { AdminAreaUploadDto } from './dto/upload-admin-areas.dto';
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
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiQuery({
    name: 'reset',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description:
      'IMPORTANT: Set to true to remove all existing admin-areas for this country and admin-level before adding new ones. USE WITH CARE: This may come with removal of event data.',
  })
  @Post(':countryCodeISO3/:adminLevel')
  @UseInterceptors()
  public async addOrUpdateAdminAreas(
    @Param() params: AdminAreaParams,
    @Body() body: AdminAreaUploadDto,
    @Query('reset', new ParseBoolPipe({ optional: true }))
    reset: boolean,
    @Res() res,
  ): Promise<string> {
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
    summary:
      'Delete set of admin-areas. USE WITH CARE: This may come with removal of event data.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @Delete(':countryCodeISO3/:adminLevel')
  @UseInterceptors()
  public async deleteAdminAreas(
    @Param() params: AdminAreaParams,
    @Body() body: DeleteAdminAreasDto,
    @Res() res,
  ): Promise<string> {
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

  @Roles(UserRole.Admin)
  @ApiOperation({
    summary:
      'Adds or updates (if existing) event-areas (currently Flash-floods only)',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiResponse({
    status: 201,
    description: 'Added and/or Updated admin-areas.',
  })
  @Post('event-areas/:countryCodeISO3/:disasterType')
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
      'Get (relevant) admin-areas boundaries and attributes for given country, disater-type and lead-time (as GeoJSON)',
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
