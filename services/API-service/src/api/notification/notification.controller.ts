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
import { SendEmailDto } from './dto/send-email.dto';
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
      'Send e-mail notification about disaster to recipients for given country and disaster-type. (Used at the end of various IBF pipelines)',
  })
  @ApiResponse({
    status: 200,
    description:
      'E-mail notification request sent (e-mails sent only if there is an active trigger)',
  })
  @Post('send')
  @ApiConsumes()
  @UseInterceptors()
  public async exposure(@Body() sendEmailDto: SendEmailDto): Promise<void> {
    await this.notificationService.send(
      sendEmailDto.countryCodeISO3,
      sendEmailDto.disasterType,
    );
  }
}
