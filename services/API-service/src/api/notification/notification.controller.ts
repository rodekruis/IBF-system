import { NotificationService } from './notification.service';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../user/user-role.enum';

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
  @Post('send')
  @ApiConsumes()
  @UseInterceptors()
  public async send(
    @Body() sendNotification: SendNotificationDto,
  ): Promise<void> {
    await this.notificationService.send(
      sendNotification.countryCodeISO3,
      sendNotification.disasterType,
      sendNotification.date,
    );
  }
}
