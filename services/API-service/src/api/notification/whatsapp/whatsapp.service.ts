import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { EXTERNAL_API } from '../../../config';
import { EventSummaryCountry } from '../../../shared/data.model';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { EventService } from '../../event/event.service';
import { UserEntity } from '../../user/user.entity';
import { LookupService } from '../lookup/lookup.service';
import { NotificationContentService } from '../notification-content/notification-content.service';
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

  public constructor(
    private readonly eventService: EventService,
    private readonly lookupService: LookupService,
    private readonly notificationContentService: NotificationContentService,
  ) {}

  public async sendTestWhatsapp(
    message: string,
    recipientPhoneNr: string,
  ): Promise<void> {
    const validatedPhoneNumber = await this.lookupService.lookupAndCorrect(
      recipientPhoneNr,
    );
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

  public async configureInitialMessage(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: EventSummaryCountry[],
  ): Promise<string> {
    const event = activeEvents[0];

    const baseMessage = country.notificationInfo.whatsappMessage['initial'];
    const startDate = event.startDate;

    const triggers = await this.eventService.getTriggerPerLeadtime(
      country.countryCodeISO3,
      disasterType,
      event.eventName,
    );

    // This code is exactly the same in event.service.ts in front-end. Better to combine in back-end instead.
    const keys = Object.keys(triggers)
      .filter(key => Object.values(LeadTime).includes(key as LeadTime))
      .sort((a, b) =>
        Number(a.split('-')[0]) > Number(b.split('-')[0]) ? 1 : -1,
      );
    let firstKey: string;
    for (const key of keys) {
      if (triggers[key] === '1') {
        firstKey = key;
        break;
      }
    }
    const leadTime = `${firstKey.split('-').join(' ')}(s)`;

    // This code now assumes certain parameters in data. This is not right.
    const message = baseMessage
      .replace('[startDate]', startDate)
      .replace('[leadTime]', leadTime);

    return message;
  }

  public async sendTriggerViaWhatsapp(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: EventSummaryCountry[],
  ) {
    const message = await this.configureInitialMessage(
      country,
      disasterType,
      activeEvents,
    );

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

    // Take first of theoretically multiple users with this number (ignore that edge case for now)
    const user = await this.userRepository.findOne({
      where: { whatsappNumber: fromNumber },
      relations: [
        'countries',
        'countries.disasterTypes',
        'countries.countryDisasterSettings',
        'countries.countryDisasterSettings.activeLeadTimes',
        'countries.notificationInfo',
      ],
    });
    if (!user) {
      // or send generic reply here?
      throw new HttpException(
        `Not a known user in IBF-platform.`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Assume first of theoretically multiple countries for this user (ignore that edge case for now)
    const country = user.countries[0];
    for await (const disasterType of country.disasterTypes) {
      const events = await this.eventService.getEventSummaryCountry(
        country.countryCodeISO3,
        disasterType.disasterType,
      );
      const activeEvents = events.filter(event => event.activeTrigger);
      if (activeEvents.length === 0) {
        const noTriggerMessage = this.configureNoTriggerMessage(
          country,
          events,
        );
        await this.sendWhatsapp(noTriggerMessage, fromNumber);
        return;
      }

      const eventName = activeEvents[0].eventName || 'no-name';
      const triggerMessage = await this.configureFollowUpMessage(
        country,
        disasterType.disasterType,
        activeEvents,
      );
      await this.sendWhatsapp(
        triggerMessage,
        fromNumber,
        `${EXTERNAL_API.eventMapImage}/${country.countryCodeISO3}/${disasterType.disasterType}/${eventName}`,
      );

      // Add small delay/sleep to ensure the order in which messages are received
      await new Promise(resolve => setTimeout(resolve, 2000));

      const whatsappGroupMessage = this.configureWhatsappGroupMessage(country);
      await this.sendWhatsapp(whatsappGroupMessage, fromNumber);
    }
  }

  private configureNoTriggerMessage(
    country: CountryEntity,
    events: EventSummaryCountry[],
  ): string {
    let message = '';
    if (events.length > 0) {
      message += country.notificationInfo.whatsappMessage[
        'no-trigger-old-event'
      ].replace('[startDate]', events[0].startDate);
    }
    message += country.notificationInfo.whatsappMessage['no-trigger'];
    return message;
  }

  private configureWhatsappGroupMessage(country: CountryEntity): string {
    const baseWhatsappGroupMessage =
      country.notificationInfo.whatsappMessage['whatsapp-group'];
    const whatsappGroupLink = country.notificationInfo.linkSocialMediaUrl;
    const externalActionsForm =
      country.notificationInfo.externalEarlyActionForm;
    const whatsappGroupMessage = baseWhatsappGroupMessage
      .replace('[whatsappGroupLink]', whatsappGroupLink)
      .replace('[externalActionsForm]', externalActionsForm);
    return whatsappGroupMessage;
  }

  private async configureFollowUpMessage(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: EventSummaryCountry[],
  ): Promise<string> {
    const countryDisasterSettings = country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    );
    const adminLevel = countryDisasterSettings.defaultAdminLevel;

    const triggeredAreas = await this.eventService.getTriggeredAreas(
      country.countryCodeISO3,
      disasterType,
      countryDisasterSettings.defaultAdminLevel,
      countryDisasterSettings.activeLeadTimes[0].leadTimeName, // assumes only 1 leadtime..
      activeEvents[0].eventName,
    );

    const adminAreaLabel = country.adminRegionLabels[String(adminLevel)][
      'plural'
    ].toLowerCase();
    const actionUnit = await this.notificationContentService.getActionUnit(
      disasterType,
    );
    let areaList = '';
    for (const area of triggeredAreas) {
      const row = `- *${area.name}${
        area.nameParent ? ' (' + area.nameParent + ')' : ''
      } - ${this.notificationContentService.formatActionUnitValue(
        area.actionsValue,
        actionUnit,
      )}*\n`;
      areaList += row;
    }
    const followUpMessage =
      country.notificationInfo.whatsappMessage['follow-up'];
    const message = followUpMessage
      .replace('[nrTriggeredAreas]', triggeredAreas.length)
      .replace('[adminAreaLabel]', adminAreaLabel)
      .replace('[areaList]', areaList);
    return message;
  }
}
