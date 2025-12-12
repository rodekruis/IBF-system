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
import { AlertArea, Event } from '../../shared/data.model';
import { AdminLevel } from '../country/admin-level.enum';
import { CountryService } from '../country/country.service';
import { CountryDisasterType } from '../country/country-disaster.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { UserRole } from '../user/user-role.enum';
import { ActivationLogDto } from './dto/event-place-code.dto';
import { LastUploadDateDto } from './dto/last-upload-date.dto';
import {
  UploadAlertsPerLeadTimeDto,
  UploadTriggerPerLeadTimeDto,
} from './dto/upload-alerts-per-lead-time.dto';
import { EventService } from './event.service';

@ApiTags('event')
@Controller('event')
export class EventController {
  public constructor(
    private eventService: EventService,
    private countryService: CountryService,
  ) {}

  // NOTE: This endpoint is intentionally public (no authentication required) for external consumption.
  // It is used by external integrations such as Montandon (IFRC GO) to fetch active event data.
  @ApiOperation({
    summary:
      '[EXTERNALLY USED - PUBLIC] Get active events for external integrations (e.g., Montandon/IFRC GO)',
  })
  @ApiQuery({ name: 'countryCodeISO3', required: false, type: 'string' })
  @ApiQuery({ name: 'disasterType', required: false, enum: DisasterType })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'monty'] })
  @ApiResponse({
    status: 200,
    description: 'List of active events',
    type: [Event],
  })
  @Get()
  public async getEvents(
    @Query()
    {
      countryCodeISO3,
      disasterType,
      format,
    }: CountryDisasterType & { format: 'json' | 'monty' },
  ) {
    const countryCodesISO3 = countryCodeISO3 ? [countryCodeISO3] : [];
    const countries = await this.countryService.getCountries(countryCodesISO3);
    const disasterTypes = disasterType
      ? [disasterType]
      : Object.values(DisasterType);
    const events: Event[] = [];

    for (const { countryCodeISO3 } of countries) {
      for (const disasterType of disasterTypes) {
        const countryDisasterTypeEvents = await this.eventService.getEvents(
          countryCodeISO3,
          disasterType,
        );

        events.push(...countryDisasterTypeEvents);
      }
    }

    if (format === 'monty') {
      const montyEvents = await Promise.all(
        events.map((event) => this.eventService.toMontyEvent(event)),
      );

      return montyEvents;
    }

    return events;
  }

  @ApiBearerAuth()
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
  public async getLastUploadDate(
    @Param() { countryCodeISO3, disasterType }: CountryDisasterType,
  ): Promise<LastUploadDateDto> {
    return await this.eventService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
  }

  @ApiBearerAuth()
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
    @Param() { countryCodeISO3, disasterType }: CountryDisasterType,
    @Query() { eventName }: { eventName?: string },
  ): Promise<object> {
    return await this.eventService.getAlertPerLeadTime(
      countryCodeISO3,
      disasterType,
      eventName,
    );
  }

  @ApiBearerAuth()
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
    @Query() { countryCodeISO3, disasterType }: CountryDisasterType,
  ): Promise<ActivationLogDto[]> {
    return await this.eventService.getActivationLogData(
      countryCodeISO3,
      disasterType,
    );
  }

  // NOTE: keep this endpoint in until all pipelines migrated to /alerts-per-lead-time
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Pipeline)
  @ApiOperation({
    summary:
      '[EXTERNALLY USED - PIPELINE] [OLD endpoint] Upload alert data per leadtime',
  })
  @ApiResponse({ status: 201, description: 'Uploaded alert data per leadtime' })
  @Post('triggers-per-leadtime')
  public async uploadTriggerPerLeadTime(
    @Body() uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    await this.eventService.convertOldDtoAndUploadAlertPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Pipeline)
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

  @ApiBearerAuth()
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
    @Param()
    {
      countryCodeISO3,
      disasterType,
      adminLevel,
    }: CountryDisasterType & { adminLevel: AdminLevel },
    @Query() { eventName }: { eventName?: string },
  ): Promise<AlertArea[]> {
    return await this.eventService.getAlertAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
    );
  }
}
