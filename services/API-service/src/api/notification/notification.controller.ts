import { NotificationService } from './notification.service';
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
import { RolesGuard } from '../../roles.guard';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';
import { NotificationApiTestResponseDto } from './dto/notification-api-test-response.dto';

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
    type: 'boolean',
    description:
      'If true, only returns the notification content without sending it',
  })
  @Post('send')
  @ApiConsumes()
  @UseInterceptors()
  public async send(
    @Body() sendNotification: SendNotificationDto,
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
