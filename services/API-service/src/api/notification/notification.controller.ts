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
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { SendEmailDto } from './dto/send-email.dto';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  private readonly notificationService: NotificationService;
  public constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Send notification about disaster to email recipients',
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
