import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { format } from 'date-fns';
import { IsNull, Not, Repository } from 'typeorm';

import { PROD, WHATSAPP_STATUS_API_URL } from '../../../config';
import { Event } from '../../../shared/data.model';
import { HelperService } from '../../../shared/helper.service';
import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { AlertLevel } from '../../event/enum/alert-level.enum';
import { EventService } from '../../event/event.service';
import { MetadataService } from '../../metadata/metadata.service';
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
  private logger = new Logger('WhatsappService');

  @InjectRepository(TwilioMessageEntity)
  private readonly twilioMessageRepository: Repository<TwilioMessageEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(
    private readonly eventService: EventService,
    private readonly metadataService: MetadataService,
    private readonly lookupService: LookupService,
    private readonly notificationContentService: NotificationContentService,
    private readonly helperService: HelperService,
  ) {}

  public async sendTestWhatsapp(
    message: string,
    recipientPhoneNr: string,
  ): Promise<void> {
    const validatedPhoneNumber =
      await this.lookupService.lookupAndCorrect(recipientPhoneNr);
    await this.sendWhatsapp(message, null, null, validatedPhoneNumber);
  }

  private async sendWhatsapp(
    message: string,
    contentSid: string,
    contentVariables: object,
    recipientPhoneNr: string,
    mediaUrl?: string,
  ) {
    const payload = {
      body: PROD && contentSid ? undefined : message,
      contentSid: PROD ? contentSid : null,
      contentVariables:
        PROD && contentVariables ? JSON.stringify(contentVariables) : undefined,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
      statusCallback: WHATSAPP_STATUS_API_URL,
      to: 'whatsapp:' + recipientPhoneNr,
    };
    if (mediaUrl) {
      payload['mediaUrl'] = mediaUrl;
    }
    return twilioClient.messages
      .create(payload)
      .then((message) => {
        this.storeSendWhatsapp(message, mediaUrl);
        return message.sid;
      })
      .catch((error: unknown) => {
        this.logger.log(`Failed to create Twilio message. Error: ${error}`);
        throw error;
      });
  }

  private async configureInitialMessage(
    country: CountryEntity,
    activeEvents: Event[],
    disasterType: DisasterType,
  ): Promise<{
    message: string;
    contentSid: string;
    contentVariables: object;
  }> {
    activeEvents.sort((a, b) => (a.firstLeadTime > b.firstLeadTime ? 1 : -1));
    let message: string;
    let contentSid: string;
    let contentVariables: object;
    if (activeEvents.length === 1) {
      const baseMessage =
        country.notificationInfo.whatsappMessage[disasterType][
          'initial-single-event'
        ].text;
      contentSid =
        country.notificationInfo.whatsappMessage[disasterType][
          'initial-single-event'
        ].contentSid;
      const alertState =
        activeEvents[0].alertLevel === AlertLevel.TRIGGER
          ? 'trigger'
          : 'warning'; // REFACTOR: alert level none is not handled
      const startTimeEvent =
        await this.notificationContentService.getFirstLeadTimeString(
          activeEvents[0],
          country.countryCodeISO3,
          disasterType,
        );

      message = baseMessage
        .replace(/\[alertState\]/g, alertState)
        .replace('[eventName]', activeEvents[0].eventName)
        .replace('[startTimeEvent]', startTimeEvent);

      // REFACTOR: this is extremely hacky, but born out of lack of time
      if (disasterType === DisasterType.FlashFloods) {
        contentVariables = {
          1: alertState,
          2: alertState,
          3: activeEvents[0].eventName,
          4: startTimeEvent,
        };
      } else if (disasterType === DisasterType.Floods) {
        contentVariables = { 1: startTimeEvent };
      }
    } else if (activeEvents.length > 1) {
      const baseMessage =
        country.notificationInfo.whatsappMessage[disasterType][
          'initial-multi-event'
        ].text;
      contentSid =
        country.notificationInfo.whatsappMessage[disasterType][
          'initial-multi-event'
        ].contentSid;

      const startTimeFirstEvent =
        await this.notificationContentService.getFirstLeadTimeString(
          activeEvents[0],
          country.countryCodeISO3,
          disasterType,
        );

      message = baseMessage
        .replace('[nrEvents]', activeEvents.length)
        .replace('[startTimeFirstEvent]', startTimeFirstEvent);

      // REFACTOR: this is extremely hacky, but born out of lack of time
      if (disasterType === DisasterType.FlashFloods) {
        contentVariables = {
          1: activeEvents.length.toString(),
          2: startTimeFirstEvent,
        };
      }
    }

    return { message, contentSid, contentVariables };
  }

  public async sendActiveEventsWhatsapp(
    country: CountryEntity,
    activeEvents: Event[],
    disasterType: DisasterType,
  ) {
    const { message, contentSid, contentVariables } =
      await this.configureInitialMessage(country, activeEvents, disasterType);

    await this.sendToUsers(
      country,
      disasterType,
      message,
      contentSid,
      contentVariables,
    );

    // Add small delay to ensure the order in which messages are received
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // public async sendEventFinishedWhatsapp(
  //   country: CountryEntity,
  //   finishedEvent: Event,
  //   disasterType: DisasterType,
  // ) {
  //   const message = this.configureTriggerFinishedMessage(
  //     country,
  //     finishedEvent,
  //     disasterType,
  //   );

  //   await this.sendToUsers(country, disasterType, message);
  // }

  private async sendToUsers(
    country: CountryEntity,
    disasterType: DisasterType,
    message: string,
    contentSid: string,
    contentVariables: object,
  ) {
    const users = await this.userRepository.find({
      where: { whatsappNumber: Not(IsNull()) },
      relations: ['countries', 'disasterTypes'],
    });

    for (const user of users) {
      if (
        !this.isCountryEnabledForUser(user, country.countryCodeISO3) ||
        !this.isDisasterEnabledForUser(user, disasterType)
      ) {
        continue;
      }

      await this.sendWhatsapp(
        message,
        contentSid,
        contentVariables,
        user.whatsappNumber,
      );
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
    const findOneOptions = { sid };
    return await this.twilioMessageRepository.findOne({
      where: findOneOptions,
    });
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
        'countries.notificationInfo',
        'disasterTypes',
      ],
    });
    if (!user) {
      // or send generic reply here?
      throw new HttpException(
        `Not a known user in IBF-platform.`,
        HttpStatus.NOT_FOUND,
      );
    }

    for await (const country of user.countries) {
      for await (const disasterType of user.disasterTypes.filter(
        (d) => country.notificationInfo.useWhatsapp[d.disasterType],
      )) {
        const events = await this.eventService.getEvents(
          country.countryCodeISO3,
          disasterType.disasterType,
        );
        const sortedEvents = events.sort((a, b) =>
          a.firstLeadTime > b.firstLeadTime ? 1 : -1,
        );
        if (sortedEvents.length === 0) {
          const noTriggerMessage = this.configureNoTriggerMessage(
            country,
            events,
            disasterType.disasterType,
          );
          return await this.sendWhatsapp(
            noTriggerMessage,
            null,
            null,
            fromNumber,
          );
        }

        for (const event of sortedEvents) {
          const triggerMessage = await this.configureFollowUpMessage(
            country,
            disasterType.disasterType,
            event,
          );

          await this.sendWhatsapp(triggerMessage, null, null, fromNumber);
          // Add small delay to ensure the order in which messages are received
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        const whatsappGroupMessage = this.configureWhatsappGroupMessage(
          country,
          disasterType.disasterType,
        );
        await this.sendWhatsapp(whatsappGroupMessage, null, null, fromNumber);
      }
    }
  }

  private configureNoTriggerMessage(
    country: CountryEntity,
    events: Event[],
    disasterType: DisasterType,
  ): string {
    let message = '';
    if (events.length > 0) {
      message += country.notificationInfo.whatsappMessage[disasterType][
        'no-trigger-old-event'
      ].text.replace(
        '[firstIssuedDate]',
        format(events[0].firstIssuedDate, 'yyyy-MM-dd'),
      );
    }
    message +=
      country.notificationInfo.whatsappMessage[disasterType]['no-trigger'].text;
    return message;
  }

  private configureTriggerFinishedMessage(
    country: CountryEntity,
    event: Event,
    disasterType: DisasterType,
  ): string {
    let message = '';
    if (event) {
      message += country.notificationInfo.whatsappMessage[disasterType][
        'no-trigger-old-event'
      ].replace(
        '[firstIssuedDate]',
        format(event.firstIssuedDate, 'yyyy-MM-dd'),
      );
    }
    message +=
      country.notificationInfo.whatsappMessage[disasterType][
        'trigger-finished'
      ];
    return message;
  }

  private configureWhatsappGroupMessage(
    country: CountryEntity,
    disasterType: DisasterType,
  ): string {
    const baseWhatsappGroupMessage =
      country.notificationInfo.whatsappMessage[disasterType]['whatsapp-group']
        .text;
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
    event: Event,
  ): Promise<string> {
    const adminLevel = country.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).defaultAdminLevel;

    const alertState =
      event.alertLevel === AlertLevel.TRIGGER ? 'trigger' : 'warning'; // REFACTOR: alert level none is not handled

    const alertAreas = await this.eventService.getAlertAreas(
      country.countryCodeISO3,
      disasterType,
      adminLevel,
      event.eventName,
    );

    const adminAreaLabel =
      country.adminRegionLabels[String(adminLevel)]['plural'].toLowerCase();
    const mainExposureIndicatorMetadata =
      await this.metadataService.getMainExposureIndicatorMetadata(disasterType);
    let areaList = '';
    for (const area of alertAreas) {
      const row = `- *${area.name}${
        area.nameParent ? ' (' + area.nameParent + ')' : ''
      } - ${this.helperService.toCompactNumber(
        area.mainExposureValue,
        mainExposureIndicatorMetadata.numberFormatMap,
      )}*\n`;
      areaList += row;
    }

    const startTimeEvent =
      await this.notificationContentService.getFirstLeadTimeString(
        event,
        country.countryCodeISO3,
        disasterType,
      );

    const followUpMessage =
      country.notificationInfo.whatsappMessage[disasterType]['follow-up'].text;
    const message = followUpMessage
      .replace(/\[alertState\]/g, alertState)
      .replace('[eventName]', event.eventName)
      .replace('[startTimeEvent]', startTimeEvent)
      .replace('[nrAlertAreas]', alertAreas.length)
      .replace('[adminAreaLabel]', adminAreaLabel)
      .replace('[areaList]', areaList);
    return message;
  }

  public async sendCommunityNotification(
    countryCodeISO3: string,
  ): Promise<void> {
    //hardcoding country and disaster type until we'll make this more generic
    if (countryCodeISO3 !== 'UGA') {
      return;
    }
    const disasterType = DisasterType.Floods;

    const messageKey = 'community-notification';

    const country = await this.countryRepository.findOne({
      where: { countryCodeISO3 },
      relations: ['notificationInfo'],
    });

    let message: string;
    let contentSid: string;
    try {
      message =
        country.notificationInfo.whatsappMessage[disasterType][messageKey].text;
      contentSid =
        country.notificationInfo.whatsappMessage[disasterType][messageKey]
          .contentSid;
    } catch (error: unknown) {
      this.logger.log(`Message not found in notificationInfo. Error: ${error}`);
      return;
    }

    this.sendToUsers(country, disasterType, message, contentSid, null);
  }

  private isCountryEnabledForUser(
    user: UserEntity,
    countryCodeISO3: string,
  ): boolean {
    return user.countries.some((c) => c.countryCodeISO3 === countryCodeISO3);
  }

  private isDisasterEnabledForUser(
    user: UserEntity,
    disasterType: DisasterType,
  ): boolean {
    return (
      user.disasterTypes.length === 0 ||
      user.disasterTypes.some((d) => d.disasterType === disasterType)
    );
  }
}
