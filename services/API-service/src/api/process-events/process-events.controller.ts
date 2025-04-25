import {
  Body,
  Controller,
  HttpCode,
  ParseBoolPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UpdateResult } from 'typeorm';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { SetTriggerDto } from '../event/dto/event-place-code.dto';
import { NotificationApiTestResponseDto } from '../notification/dto/notification-api-test-response.dto';
import { UserRole } from '../user/user-role.enum';
import { UserDecorator } from '../user/user.decorator';
import { ProcessEventsDto } from './dto/process-events.dto';
import { ProcessEventsService } from './process-events.service';

@ApiBearerAuth()
@ApiTags('event')
@Controller()
export class ProcessEventsController {
  public constructor(
    private readonly processEventsService: ProcessEventsService,
  ) {}

  // NOTE: remove after  all pipelines migrated to /event/process
  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      '[EXTERNALLY USED - PIPELINE] Close events automatically for given country and disaster-type. Must be run at end of every pipeline. As a backup, the same logic is also in /notification/send endpoint.',
  })
  @ApiResponse({ status: 201, description: 'Closed finished events.' })
  @Post('event/close-events')
  public async closeEvents(
    @Body() closeEventsDto: ProcessEventsDto,
  ): Promise<void> {
    // NOTE: this old endpoint will also point to this new method already
    await this.processEventsService.processEvents(
      closeEventsDto.countryCodeISO3,
      closeEventsDto.disasterType,
      true, // Make sure to only send notifications once in transition period for pipelines that currently have /close-events & /notification/send
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      '[EXTERNALLY USED - PIPELINE] Process events for given country and disaster-type. Must be run at end of every pipeline.',
  })
  @ApiResponse({ status: 200, description: 'Processed events.' })
  @ApiQuery({
    name: 'noNotifications',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description: 'If true, returns the notification content without sending it',
  })
  @Post('events/process')
  @HttpCode(200)
  public async processEvents(
    @Body() processEventsDto: ProcessEventsDto,
    @Query('noNotifications', new ParseBoolPipe({ optional: true }))
    noNotifications: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    return await this.processEventsService.processEvents(
      processEventsDto.countryCodeISO3,
      processEventsDto.disasterType,
      noNotifications,
    );
  }

  // NOTE: remove after  all pipelines migrated to /event/process
  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      '[EXTERNALLY USED - PIPELINE] Old endpoint to send notification instructions. Runs full /events/process in practice.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Notification request sent (actual emails/whatsapps sent only if there is an active event)',
  })
  @ApiQuery({
    name: 'noNotifications',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description:
      'If true, only returns the notification content without sending it',
  })
  @Post('notification/send')
  @ApiConsumes()
  @UseInterceptors()
  public async send(
    @Body() processEventsDto: ProcessEventsDto,
    @Query('noNotifications', new ParseBoolPipe({ optional: true }))
    noNotifications: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    return await this.processEventsService.processEvents(
      processEventsDto.countryCodeISO3,
      processEventsDto.disasterType,
      noNotifications,
    );
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      '[DEV/TEST/DEMO only] Send test notification (email and/or whatsapp) about events to recipients for given country and disaster-type.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Notification request sent (actual emails/whatsapps sent only if there is an active event)',
  })
  @ApiQuery({
    name: 'noNotifications',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description:
      'If true, only returns the notification content without sending it',
  })
  @Post('events/notify')
  @ApiConsumes()
  @UseInterceptors()
  public async notify(
    @Body() processEventsDto: ProcessEventsDto,
    @Query('noNotifications', new ParseBoolPipe({ optional: true }))
    noNotifications: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    return await this.processEventsService.notify(
      processEventsDto.countryCodeISO3,
      processEventsDto.disasterType,
      noNotifications,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.LocalAdmin)
  @ApiOperation({
    summary: 'Set trigger for event admin-areas and send notifications.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Event admin-areas are set to trigger and notifications are sent.',
  })
  @Post('events/set-trigger')
  public async setTrigger(
    @UserDecorator('userId') userId: string,
    @Body() setTriggerDto: SetTriggerDto,
  ): Promise<UpdateResult> {
    return await this.processEventsService.setTrigger(userId, setTriggerDto);
  }
}
