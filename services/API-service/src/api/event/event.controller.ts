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

import { UpdateResult } from 'typeorm';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { AlertArea, EventSummaryCountry } from '../../shared/data.model';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { UserDecorator } from '../user/user.decorator';
import {
  ActivationLogDto,
  EventPlaceCodesDto,
} from './dto/event-place-code.dto';
import { LastUploadDateDto } from './dto/last-upload-date.dto';
import {
  UploadAlertsPerLeadTimeDto,
  UploadTriggerPerLeadTimeDto,
} from './dto/upload-alerts-per-lead-time.dto';
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
  public async getAlertPerLeadTime(
    @Param() params,
    @Query() query,
  ): Promise<object> {
    return await this.eventService.getAlertPerLeadTime(
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
  @Roles(UserRole.LocalAdmin)
  @ApiOperation({ summary: 'Set trigger for event admin-areas.' })
  @ApiResponse({
    status: 201,
    description: 'Event admin-areas are set to trigger.',
  })
  @Post('set-trigger')
  public async setTrigger(
    @UserDecorator('userId') userId: string,
    @Body() eventPlaceCodesDto: EventPlaceCodesDto,
  ): Promise<UpdateResult> {
    return await this.eventService.setTrigger(userId, eventPlaceCodesDto);
  }

  // NOTE: keep this endpoint in until all pipelines migrated to /alerts-per-lead-time
  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      '[EXTERNALLY USED - PIPELINE] [OLD endpoint] Upload alert data per leadtime',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded alert data per leadtime',
  })
  @Post('triggers-per-leadtime')
  public async uploadTriggerPerLeadTime(
    @Body() uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.convertOldDtoAndUploadAlertPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary: '[EXTERNALLY USED - PIPELINE] Upload alert data per lead time',
  })
  @ApiResponse({
    status: 201,
    description: 'Uploaded alert data per lead time',
  })
  @Post('alerts-per-lead-time')
  public async uploadAlertsPerLeadTime(
    @Body() uploadAlertsPerLeadTimeDto: UploadAlertsPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.uploadAlertsPerLeadTime(uploadAlertsPerLeadTimeDto);
  }
}
