import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { EXTERNAL_API } from '../../../config';
import { EventSummaryCountry } from '../../../shared/data.model';
import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { EventMapImageEntity } from '../../event/event-map-image.entity';
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
import { formatActionUnitValue } from '../helpers/format-action-unit-value.helper';

@Injectable()
export class WhatsappService {
  @InjectRepository(TwilioMessageEntity)
  private readonly twilioMessageRepository: Repository<TwilioMessageEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(EventMapImageEntity)
  private readonly eventMapImageRepository: Repository<EventMapImageEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

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
  ) {
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
      .then((message) => {
        this.storeSendWhatsapp(message, mediaUrl);
        return message.sid;
      })
      .catch((err) => {
        console.log('Error from Twilio:', err);
        throw err;
      });
  }

  private async configureInitialMessage(
    country: CountryEntity,
    activeEvents: EventSummaryCountry[],
    disasterType: DisasterType,
  ): Promise<string> {
    activeEvents.sort((a, b) => (a.firstLeadTime > b.firstLeadTime ? 1 : -1));

    if (activeEvents.length === 1) {
      const baseMessage =
        country.notificationInfo.whatsappMessage[disasterType][
          'initial-single-event'
        ];
      const triggerState = activeEvents[0].thresholdReached
        ? 'trigger'
        : 'warning';
      const startTimeEvent =
        await this.notificationContentService.getFirstLeadTimeString(
          activeEvents[0],
          country.countryCodeISO3,
          disasterType,
        );

      return baseMessage
        .replace('[triggerState]', triggerState)
        .replace('[triggerState]', triggerState)
        .replace('[eventName]', activeEvents[0].eventName)
        .replace('[startTimeEvent]', startTimeEvent);
    } else if (activeEvents.length > 1) {
      const baseMessage =
        country.notificationInfo.whatsappMessage[disasterType][
          'initial-multi-event'
        ];

      const startTimeFirstEvent =
        await this.notificationContentService.getFirstLeadTimeString(
          activeEvents[0],
          country.countryCodeISO3,
          disasterType,
        );

      // This code now assumes certain parameters in data. This is not right.
      return baseMessage
        .replace('[nrEvents]', activeEvents.length)
        .replace('[startTimeFirstEvent]', startTimeFirstEvent);
    }
  }

  public async sendTriggerWhatsapp(
    country: CountryEntity,
    activeEvents: EventSummaryCountry[],
    disasterType: DisasterType,
  ) {
    const message = await this.configureInitialMessage(
      country,
      activeEvents,
      disasterType,
    );

    await this.sendToUsers(country, disasterType, message);

    // Add small delay to ensure the order in which messages are received
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  public async sendTriggerFinishedWhatsapp(
    country: CountryEntity,
    finishedEvent: EventSummaryCountry,
    disasterType: DisasterType,
  ) {
    const message = this.configureTriggerFinishedMessage(
      country,
      finishedEvent,
      disasterType,
    );

    await this.sendToUsers(country, disasterType, message);
  }

  private async sendToUsers(
    country: CountryEntity,
    disasterType: DisasterType,
    message: string,
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
        'countries.countryDisasterSettings.activeLeadTimes',
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
        const events = await this.eventService.getEventSummary(
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
          return await this.sendWhatsapp(noTriggerMessage, fromNumber);
        }

        for (const event of sortedEvents) {
          const triggerMessage = await this.configureFollowUpMessage(
            country,
            disasterType.disasterType,
            event,
          );
          const eventName = event.eventName;
          const eventMapImageEntity =
            await this.eventMapImageRepository.findOne({
              where: {
                countryCodeISO3: country.countryCodeISO3,
                disasterType: disasterType.disasterType,
                eventName: !eventName ? IsNull() : eventName,
              },
            });

          await this.sendWhatsapp(
            triggerMessage,
            fromNumber,
            eventMapImageEntity
              ? `${EXTERNAL_API.eventMapImage}/${country.countryCodeISO3}/${
                  disasterType.disasterType
                }/${eventName || 'no-name'}`
              : null,
          );
          // Add small delay to ensure the order in which messages are received
          await new Promise((resolve) =>
            setTimeout(resolve, eventMapImageEntity ? 5000 : 2000),
          );
        }

        const whatsappGroupMessage = this.configureWhatsappGroupMessage(
          country,
          disasterType.disasterType,
        );
        await this.sendWhatsapp(whatsappGroupMessage, fromNumber);
      }
    }
  }

  private configureNoTriggerMessage(
    country: CountryEntity,
    events: EventSummaryCountry[],
    disasterType: DisasterType,
  ): string {
    let message = '';
    if (events.length > 0) {
      message += country.notificationInfo.whatsappMessage[disasterType][
        'no-trigger-old-event'
      ].replace('[startDate]', events[0].startDate);
    }
    message +=
      country.notificationInfo.whatsappMessage[disasterType]['no-trigger'];
    return message;
  }

  private configureTriggerFinishedMessage(
    country: CountryEntity,
    event: EventSummaryCountry,
    disasterType: DisasterType,
  ): string {
    let message = '';
    if (event) {
      message += country.notificationInfo.whatsappMessage[disasterType][
        'no-trigger-old-event'
      ].replace('[startDate]', event.startDate);
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
      country.notificationInfo.whatsappMessage[disasterType]['whatsapp-group'];
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
    event: EventSummaryCountry,
  ): Promise<string> {
    const adminLevel = country.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).defaultAdminLevel;

    const triggerState = event.thresholdReached ? 'trigger' : 'warning';

    const triggeredAreas = await this.eventService.getTriggeredAreas(
      country.countryCodeISO3,
      disasterType,
      adminLevel,
      event.firstLeadTime,
      event.eventName,
    );

    const adminAreaLabel =
      country.adminRegionLabels[String(adminLevel)]['plural'].toLowerCase();
    const indicatorMetadata =
      await this.notificationContentService.getIndicatorMetadata(disasterType);
    let areaList = '';
    for (const area of triggeredAreas) {
      const row = `- *${area.name}${
        area.nameParent ? ' (' + area.nameParent + ')' : ''
      } - ${formatActionUnitValue(
        area.actionsValue,
        indicatorMetadata.numberFormatMap,
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
      country.notificationInfo.whatsappMessage[disasterType]['follow-up'];
    const message = followUpMessage
      .replace('[triggerState]', triggerState)
      .replace('[triggerState]', triggerState)
      .replace('[eventName]', event.eventName)
      .replace('[startTimeEvent]', startTimeEvent)
      .replace('[nrTriggeredAreas]', triggeredAreas.length)
      .replace('[adminAreaLabel]', adminAreaLabel)
      .replace('[areaList]', areaList)
      .replace('[triggerState]', triggerState);
    return message;
  }

  public async sendCommunityNotification(
    countryCodeISO3: string,
  ): Promise<void> {
    //hardcoding country and disaster type until we'll make this more generic
    if (countryCodeISO3 !== 'UGA') {
      return;
    }

    const disasterType = DisasterType.HeavyRain;

    const messageKey = 'community-notification';

    const country = await this.countryRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3 },
      relations: ['notificationInfo'],
    });

    let message: string;

    try {
      message =
        country.notificationInfo.whatsappMessage[disasterType][messageKey];
    } catch (error) {
      console.log('Message not found in notificationInfo.', error);
      return;
    }

    this.sendToUsers(country, disasterType, message);
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
    return user.disasterTypes.some((d) => d.disasterType === disasterType);
  }
}
