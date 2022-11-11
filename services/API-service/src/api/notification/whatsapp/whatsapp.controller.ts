import { Body, Controller, Post } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  SendTestWhatsappDto,
  TwilioIncomingCallbackDto,
  TwilioStatusCallbackDto,
} from './twilio.dto';
import { WhatsappService } from './whatsapp.service';

@ApiTags('notifications')
@Controller('notifications/whatsapp')
export class WhatsappController {
  private readonly whatsappService: WhatsappService;
  public constructor(whatsappService: WhatsappService) {
    this.whatsappService = whatsappService;
  }

  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @Post('status')
  public async statusCallback(
    @Body() callbackData: TwilioStatusCallbackDto,
  ): Promise<void> {
    return await this.whatsappService.statusCallback(callbackData);
  }

  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @Post('incoming')
  public async incoming(
    @Body() callbackData: TwilioIncomingCallbackDto,
  ): Promise<void> {
    return await this.whatsappService.handleIncoming(callbackData);
  }

  @Post('send-test-whatsapp')
  public async sendTestWhatsapp(
    @Body() sendTestWhatsappData: SendTestWhatsappDto,
  ): Promise<void> {
    return await this.whatsappService.sendTestWhatsapp(
      sendTestWhatsappData.message,
      sendTestWhatsappData.recipientPhoneNr,
    );
  }
}
