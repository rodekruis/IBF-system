import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
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
import { AlertArea, EventSummaryCountry } from '../../shared/data.model';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { UserDecorator } from '../user/user.decorator';
import { CountryDisasterTypeDto } from './dto/country-disaster-type.dto';
import {
  ActivationLogDto,
  EventPlaceCodeDto,
} from './dto/event-place-code.dto';
import { LastUploadDateDto } from './dto/last-upload-date.dto';
import {
  UploadAlertPerLeadTimeDto,
  uploadTriggerPerLeadTimeDto,
} from './dto/upload-alert-per-leadtime.dto';
import { EventService } from './event.service';

@ApiBearerAuth()
@ApiTags('event')
@Controller('event')
export class EventController {
  private readonly eventService: EventService;

  public constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get summary of active events - if any - for given country and disaster-type',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiResponse({
    status: 200,
    description:
      'Summary of active events - if any - for given country and disaster-type.',
    type: EventSummaryCountry,
  })
  @Get(':countryCodeISO3/:disasterType')
  public async getEventSummaryCountry(
    @Param() params,
  ): Promise<EventSummaryCountry[]> {
    return await this.eventService.getEventSummary(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get date of last (pipeline) upload for given country and disaster-type.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiResponse({
    status: 200,
    description:
      'Date of last (pipeline) upload for given country and disaster-type.',
    type: LastUploadDateDto,
  })
  @Get('last-upload-date/:countryCodeISO3/:disasterType')
  public async getLastUploadDate(@Param() params): Promise<LastUploadDateDto> {
    return await this.eventService.getLastUploadDate(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get alert data per lead-time for given country, disaster-type, event.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Alert data per lead-time for given country, disaster-type, event.',
  })
  @Get('alerts/:countryCodeISO3/:disasterType')
  public async getAlertPerLeadtime(
    @Param() params,
    @Query() query,
  ): Promise<object> {
    return await this.eventService.getAlertPerLeadtime(
      params.countryCodeISO3,
      params.disasterType,
      query.eventName,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get alerted admin-areas for given country, disaster-type, admin-level (and event-name).',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, enum: DisasterType })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiQuery({ name: 'eventName', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Alerted admin-areas for given country, disaster-type, admin-level (and event-name).',
    type: [AlertArea],
  })
  @Get('alert-areas/:countryCodeISO3/:adminLevel/:disasterType')
  public async getAlertAreas(
    @Param() params,
    @Query() query,
  ): Promise<AlertArea[]> {
    return await this.eventService.getAlertAreas(
      params.countryCodeISO3,
      params.disasterType,
      params.adminLevel,
      query.eventName,
    );
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Get past and current trigger activation data per admin-area and disaster-type.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Past and current trigger activation data per admin-area and disaster-type.',
    type: [ActivationLogDto],
  })
  @ApiQuery({ name: 'countryCodeISO3', required: false, type: 'string' })
  @ApiQuery({ name: 'disasterType', required: false, enum: DisasterType })
  @Get('activation-log')
  public async getActivationLogData(
    @Query() query,
  ): Promise<ActivationLogDto[]> {
    return await this.eventService.getActivationLogData(
      query.countryCodeISO3,
      query.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.DisasterManager)
  @ApiOperation({ summary: 'Stop trigger for given admin-area.' })
  @ApiResponse({
    status: 201,
    description: 'Trigger stopped for given admin-area.',
  })
  @ApiResponse({
    status: 404,
    description: 'No admin-area for this event.',
  })
  @Post('toggle-stopped-trigger')
  public async toggleStoppedTrigger(
    @UserDecorator('userId') userId: string,
    @Body() eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    return await this.eventService.toggleStoppedTrigger(
      userId,
      eventPlaceCodeDto,
    );
  }

  // NOTE: keep this endpoint in until all pipelines migrated to /alerts-per-leadtime
  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary: '[OLD endpoint] Upload alert data per leadtime',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded alert data per leadtime',
  })
  @Post('triggers-per-leadtime')
  public async uploadTriggerPerLeadTime(
    @Body() uploadTriggerPerLeadTimeDto: uploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.convertOldDtoAndUploadAlertPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary: 'Upload alert data per leadtime',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded alert data per leadtime',
  })
  @Post('alerts-per-leadtime')
  public async uploadAlertPerLeadTime(
    @Body() uploadAlertPerLeadTimeDto: UploadAlertPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.uploadAlertPerLeadTime(uploadAlertPerLeadTimeDto);
  }

  // NOTE: keep this endpoint in until all pipelines migrated to /event/process
  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Close events automatically for given country and disaster-type. Must be run at end of every pipeline. As a backup, the same logic is also in /notification/send endpoint.',
  })
  @ApiResponse({
    status: 201,
    description: 'Closed finished events.',
  })
  @Post('close-events')
  public async closeEvents(
    @Body() closeEventsDto: CountryDisasterTypeDto,
  ): Promise<void> {
    // NOTE: this old endpoint will also point to this new method already
    await this.eventService.processEvents(
      closeEventsDto.countryCodeISO3,
      closeEventsDto.disasterType,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Process events for given country and disaster-type. Must be run at end of every pipeline.',
  })
  @ApiResponse({
    status: 201,
    description: 'Processed events.',
  })
  @Post('process')
  public async processEvents(
    @Body() processEventsDto: CountryDisasterTypeDto,
  ): Promise<void> {
    await this.eventService.processEvents(
      processEventsDto.countryCodeISO3,
      processEventsDto.disasterType,
    );
  }
}
