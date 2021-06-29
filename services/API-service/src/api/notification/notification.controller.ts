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
import { CountryCodeISO3Dto } from './dto/country-code-iso3.dto';

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
  public async exposure(
    @Body() countryCodeISO3Dto: CountryCodeISO3Dto,
  ): Promise<void> {
    await this.notificationService.send(countryCodeISO3Dto.countryCodeISO3);
  }
}
