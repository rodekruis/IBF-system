import {
  ActivationLogDto,
  EventPlaceCodeDto,
} from './dto/event-place-code.dto';
import { EventService } from './event.service';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UploadTriggerPerLeadTimeDto } from './dto/upload-trigger-per-leadtime.dto';
import { EventSummaryCountry, TriggeredArea } from '../../shared/data.model';
import { DateDto, TriggerPerLeadTimeExampleDto } from './dto/date.dto';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('event')
@Controller('event')
export class EventController {
  private readonly eventService: EventService;

  public constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  @ApiOperation({
    summary:
      'Get summary of active events - if any - for given country and disaster-type',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
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
    return await this.eventService.getEventSummaryCountry(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @ApiOperation({
    summary:
      'Get date of last forecast-data-upload for given country and disaster-type.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Date of last forecast-data-upload for given country and disaster-type.',
    type: DateDto,
  })
  @Get('recent-date/:countryCodeISO3/:disasterType')
  public async getRecentDate(@Param() params): Promise<DateDto> {
    return await this.eventService.getRecentDate(
      params.countryCodeISO3,
      params.disasterType,
    );
  }

  @ApiOperation({
    summary:
      'Get yes/no trigger per lead-time for given country and disaster-type.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'eventName', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Yes/no trigger per lead-time for given country and disaster-type.',
    type: TriggerPerLeadTimeExampleDto,
  })
  @Get('triggers/:countryCodeISO3/:disasterType/:eventName')
  public async getTriggerPerLeadtime(@Param() params): Promise<object> {
    return await this.eventService.getTriggerPerLeadtime(
      params.countryCodeISO3,
      params.disasterType,
      params.eventName,
    );
  }

  @ApiOperation({
    summary:
      'Get triggered admin-areas for given country, disaster-type and lead-time.',
  })
  @ApiParam({ name: 'countryCodeISO3', required: true, type: 'string' })
  @ApiParam({ name: 'disasterType', required: true, type: 'string' })
  @ApiParam({ name: 'adminLevel', required: true, type: 'number' })
  @ApiParam({ name: 'leadTime', required: true, type: 'string' })
  @ApiParam({ name: 'eventName', required: true, type: 'string' })
  @ApiResponse({
    status: 200,
    description:
      'Triggered admin-areas for given country, disaster-type and lead-time.',
    type: [TriggeredArea],
  })
  @Get(
    'triggered-areas/:countryCodeISO3/:adminLevel/:disasterType/:leadTime/:eventName',
  )
  public async getTriggeredAreas(@Param() params): Promise<TriggeredArea[]> {
    return await this.eventService.getTriggeredAreas(
      params.countryCodeISO3,
      params.disasterType,
      params.adminLevel,
      params.leadTime,
      params.eventName,
    );
  }

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
  @Get('activation-log')
  public async getActivationLogData(): Promise<ActivationLogDto[]> {
    return await this.eventService.getActivationLogData();
  }

  @Roles(UserRole.DisasterManager)
  @ApiOperation({ summary: 'Close event for given admin-area.' })
  @ApiResponse({
    status: 201,
    description: 'Event closed for given admin-area.',
  })
  @ApiResponse({
    status: 404,
    description: 'No admin-area for this event.',
  })
  @ApiOperation({ summary: 'Close place code event' })
  @Post('close-place-code')
  public async closeEventPcode(
    @Body() eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    return await this.eventService.closeEventPcode(eventPlaceCodeDto);
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Upload yes/no trigger data per leadtime for given country and disaster-type',
  })
  @ApiResponse({
    status: 201,
    description:
      'Uploaded yes/no trigger data per leadtime for given country and disaster-type.',
  })
  @Post('triggers-per-leadtime')
  public async uploadTriggersPerLeadTime(
    @Body() uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.uploadTriggerPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }
}
