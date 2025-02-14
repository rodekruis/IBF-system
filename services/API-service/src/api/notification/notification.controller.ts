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
import { CountryDisasterTypeDto } from '../event/dto/country-disaster-type.dto';
import { UserRole } from '../user/user-role.enum';
import { NotificationApiTestResponseDto } from './dto/notification-api-test-response.dto';
import { NotificationService } from './notification.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  private readonly notificationService: NotificationService;
  public constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  @Roles(UserRole.PipelineUser)
  @ApiOperation({
    summary:
      'Send notification (e-mail and/or whatsapp) about disaster to recipients for given country and disaster-type. (Used at the end of various IBF pipelines)',
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
  @Post('send')
  @ApiConsumes()
  @UseInterceptors()
  public async send(
    @Body() sendNotification: CountryDisasterTypeDto,
    @Query(
      'isApiTest',
      new ParseBoolPipe({
        optional: true,
      }),
    )
    isApiTest: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    return await this.notificationService.send(
      sendNotification.countryCodeISO3,
      sendNotification.disasterType,
      isApiTest,
      sendNotification.date,
    );
  }
}
