import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { EXTERNAL_API } from '../../../config';
import { EventSummaryCountry } from '../../../shared/data.model';
import { CountryEntity } from '../../country/country.entity';
import { UserEntity } from '../../user/user.entity';
import { twilioClient } from './twilio.client';
import {
  TwilioIncomingCallbackDto,
  TwilioStatusCallbackDto,
} from './twilio.dto';
import { NotificationType, TwilioMessageEntity } from './twilio.entity';

@Injectable()
export class WhatsappService {
  @InjectRepository(TwilioMessageEntity)
  private readonly twilioMessageRepository: Repository<TwilioMessageEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  public constructor() {}

  public async sendTestWhatsapp(
    message: string,
    recipientPhoneNr: string,
  ): Promise<void> {
    const validatedPhoneNumber = await this.lookupAndCorrect(recipientPhoneNr);
    await this.sendWhatsapp(message, validatedPhoneNumber);
  }

  private async sendWhatsapp(
    message: string,
    recipientPhoneNr: string,
    mediaUrl?: string,
  ): Promise<any> {
    const payload = {
      body: message,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
      statusCallback: EXTERNAL_API.whatsAppStatus,
      to: 'whatsapp:' + recipientPhoneNr,
    };
    if (mediaUrl) {
      payload['mediaUrl'] = mediaUrl;
    }
    return twilioClient.messages
      .create(payload)
      .then(message => {
        this.storeSendWhatsapp(message, mediaUrl);
        return message.sid;
      })
      .catch(err => {
        console.log('Error from Twilio:', err);
        throw err;
      });
  }

  public configureMessage(
    country: CountryEntity,
    activeEvents: EventSummaryCountry[],
  ): string {
    const baseMessage = country.notificationInfo.whatsappMessage;
    const startDate = activeEvents[0].startDate;
    return baseMessage.replace('[startDate]', startDate);
  }

  public async sendTriggerViaWhatsapp(
    country: CountryEntity,
    activeEvents: EventSummaryCountry[],
  ) {
    const message = this.configureMessage(country, activeEvents);

    const users = await this.userRepository.find({
      where: { whatsappNumber: Not(IsNull()) },
      relations: ['countries'],
    });
    const countryUsers = users.filter(user =>
      user.countries
        .map(c => c.countryCodeISO3)
        .includes(country.countryCodeISO3),
    );
    for (const user of countryUsers) {
      await this.sendWhatsapp(message, user.whatsappNumber);
    }
  }

  public storeSendWhatsapp(message, mediaUrl: string): void {
    const twilioMessage = new TwilioMessageEntity();
    twilioMessage.accountSid = message.accountSid;
    twilioMessage.body = message.body;
    twilioMessage.mediaUrl = mediaUrl;
    twilioMessage.to = message.to;
    twilioMessage.from = message.messagingServiceSid;
    twilioMessage.sid = message.sid;
    twilioMessage.status = message.status;
    twilioMessage.type = NotificationType.Whatsapp;
    twilioMessage.dateCreated = message.dateCreated;
    this.twilioMessageRepository.save(twilioMessage);
  }

  public async findOne(sid: string): Promise<TwilioMessageEntity> {
    const findOneOptions = {
      sid: sid,
    };
    return await this.twilioMessageRepository.findOne(findOneOptions);
  }

  public async statusCallback(
    callbackData: TwilioStatusCallbackDto,
  ): Promise<void> {
    await this.twilioMessageRepository.update(
      { sid: callbackData.MessageSid },
      { status: callbackData.MessageStatus },
    );
  }

  private cleanWhatsAppNr(value: string): string {
    return value.replace('whatsapp:+', '');
  }

  public async handleIncoming(
    callbackData: TwilioIncomingCallbackDto,
  ): Promise<void> {
    if (!callbackData.From) {
      throw new HttpException(
        `No "From" address specified.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const fromNumber = this.cleanWhatsAppNr(callbackData.From);
    console.log('fromNumber: ', fromNumber);
  }

  public async lookupAndCorrect(phoneNumber: string): Promise<string> {
    try {
      const updatedPhone = this.sanitizePhoneNrExtra(phoneNumber);

      const lookupResponse = await twilioClient.lookups
        .phoneNumbers(updatedPhone)
        .fetch({ type: ['carrier'] });
      return lookupResponse.phoneNumber.replace(/\D/g, '');
    } catch (e) {
      console.log('e: ', e);
      const errors = `Provided whatsappNumber is not a valid phone number`;
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
  }

  private sanitizePhoneNrExtra(phoneNumber: string): string {
    const sanitizedPhoneNr =
      phoneNumber.substr(0, 2) == '00'
        ? phoneNumber.substr(2, phoneNumber.length - 2)
        : phoneNumber.substr(0, 3) == '+00'
        ? phoneNumber.substr(3, phoneNumber.length - 3)
        : phoneNumber.substr(0, 2) == '+0'
        ? phoneNumber.substr(2, phoneNumber.length - 2)
        : phoneNumber.substr(0, 1) == '+'
        ? phoneNumber.substr(1, phoneNumber.length - 1)
        : phoneNumber;
    return `+${sanitizedPhoneNr}`;
  }
}
