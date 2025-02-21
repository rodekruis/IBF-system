import {
  Body,
  Controller,
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

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { NotificationApiTestResponseDto } from '../notification/dto/notification-api-test-response.dto';
import { UserRole } from '../user/user-role.enum';
import { ProcessEventsDto } from './dto/process-events.dto';
import { ProcessPipelineService } from './process-pipeline.service';

@ApiBearerAuth()
@ApiTags('event')
@Controller()
export class ProcessPipelineController {
  public constructor(
    private readonly processPipelineService: ProcessPipelineService,
  ) {}

  // NOTE: remove after  all pipelines migrated to /event/process
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
  @Post('events/close-events')
  public async closeEvents(
    @Body() closeEventsDto: ProcessEventsDto,
  ): Promise<void> {
    // NOTE: this old endpoint will also point to this new method already
    await this.processPipelineService.processEvents(
      closeEventsDto.countryCodeISO3,
      closeEventsDto.disasterType,
      true, // Make sure to only send notifications once in transition period for pipelines that currently have /close-events & /notification/send
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
  @Post('events/process')
  public async processEvents(
    @Body() processEventsDto: ProcessEventsDto,
  ): Promise<void> {
    await this.processPipelineService.processEvents(
      processEventsDto.countryCodeISO3,
      processEventsDto.disasterType,
    );
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      '[DEV/TEST/DEMO only] Send test notification (e-mail and/or whatsapp) about events to recipients for given country and disaster-type.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Notification request sent (actual e-mails/whatsapps sent only if there is an active event)',
  })
  @ApiQuery({
    name: 'isApiTest',
    required: false,
    schema: { default: false, type: 'boolean' },
    type: 'boolean',
    description:
      'If true, only returns the notification content without sending it',
  })
  @Post('notification/send') // NOTE: Change to /event/notify after all pipelines have migrated
  @ApiConsumes()
  @UseInterceptors()
  public async send(
    @Body() sendNotification: ProcessEventsDto,
    @Query(
      'isApiTest',
      new ParseBoolPipe({
        optional: true,
      }),
    )
    isApiTest: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    return await this.processPipelineService.processEvents(
      sendNotification.countryCodeISO3,
      sendNotification.disasterType,
      isApiTest,
    );
  }
}
