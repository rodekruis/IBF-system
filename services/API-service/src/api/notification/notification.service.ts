import { Injectable } from '@nestjs/common';

import { EventSummaryCountry } from '../../shared/data.model';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster/disaster-type.enum';
import { EventService } from '../event/event.service';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import {
  NotificationApiTestResponseChannelDto,
  NotificationApiTestResponseDto,
} from './dto/notification-api-test-response.dto';
import { EmailService } from './email/email.service';
import { NotificationContentService } from './notification-content/notification-content.service';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Injectable()
export class NotificationService {
  public constructor(
    private readonly eventService: EventService,
    private readonly whatsappService: WhatsappService,
    private readonly emailService: EmailService,
    private readonly notificationContentService: NotificationContentService,
    private readonly typhoonTrackService: TyphoonTrackService,
  ) {}

  public async send(
    countryCodeISO3: string,
    disasterType: DisasterType,
    isApiTest: boolean,
    date?: Date,
  ): Promise<void | NotificationApiTestResponseDto> {
    const apiTestResponse = new NotificationApiTestResponseDto();
    const apiTestResponseActive = await this.sendNotificationsActiveEvents(
      disasterType,
      countryCodeISO3,
      isApiTest,
      date,
    );
    if (isApiTest && apiTestResponseActive) {
      apiTestResponse.activeEvents = apiTestResponseActive;
    }

    if (disasterType === DisasterType.Floods) {
      // Sending finished events is now for floods only
      const apiTestResponseFinished =
        await this.sendNotificationsFinishedEvents(
          countryCodeISO3,
          disasterType,
          isApiTest,
          date,
        );
      if (isApiTest && apiTestResponseFinished) {
        apiTestResponse.finishedEvents = apiTestResponseFinished;
      }
    }

    // REFACTOR: First close finished events. This is ideally done through separate endpoint called at end of pipeline, but that would require all pipelines to be updated.
    // Instead, making use of this endpoint which is already called at the end of every pipeline
    await this.eventService.closeEventsAutomatic(countryCodeISO3, disasterType);

    if (isApiTest) {
      return apiTestResponse;
    }
  }

  private async sendNotificationsActiveEvents(
    disasterType: DisasterType,
    countryCodeISO3: string,
    isApiTest: boolean,
    date?: Date,
  ): Promise<void | NotificationApiTestResponseChannelDto> {
    const apiTestResponseActive = new NotificationApiTestResponseChannelDto();

    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disasterType,
    );
    const activeNotifiableEvents: EventSummaryCountry[] = [];
    for await (const event of events) {
      if (
        await this.isNotifiableActiveEvent(event, disasterType, countryCodeISO3)
      ) {
        activeNotifiableEvents.push(event);
      }
    }

    if (activeNotifiableEvents.length) {
      const country =
        await this.notificationContentService.getCountryNotificationInfo(
          countryCodeISO3,
        );
      const messageForApiTest = await this.emailService.sendTriggerEmail(
        country,
        disasterType,
        activeNotifiableEvents,
        isApiTest,
        date,
      );
      if (isApiTest && messageForApiTest) {
        apiTestResponseActive.email = messageForApiTest;
      }
      if (country.notificationInfo.useWhatsapp[disasterType]) {
        this.whatsappService.sendTriggerWhatsapp(
          country,
          activeNotifiableEvents,
          disasterType,
        );
      }
    }
    if (isApiTest) {
      return apiTestResponseActive;
    }
  }

  private async sendNotificationsFinishedEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    isApiTest: boolean,
    date?: Date,
  ): Promise<void | NotificationApiTestResponseChannelDto> {
    const apiTestResponseFinished = new NotificationApiTestResponseChannelDto();
    const finishedNotifiableEvents =
      await this.eventService.getEventsSummaryTriggerFinishedMail(
        countryCodeISO3,
        disasterType,
      );

    if (finishedNotifiableEvents.length > 0) {
      const country =
        await this.notificationContentService.getCountryNotificationInfo(
          countryCodeISO3,
        );

      const emailFinished = await this.emailService.sendTriggerFinishedEmail(
        country,
        disasterType,
        finishedNotifiableEvents,
        isApiTest,
        date,
      );
      if (isApiTest && emailFinished) {
        apiTestResponseFinished.email = emailFinished;
      }

      if (country.notificationInfo.useWhatsapp[disasterType]) {
        for (const event of finishedNotifiableEvents) {
          await this.whatsappService.sendTriggerFinishedWhatsapp(
            country,
            event,
            disasterType,
          );
        }
      }
      if (isApiTest) {
        return apiTestResponseFinished;
      }
    }
  }

  private async isNotifiableActiveEvent(
    event: EventSummaryCountry,
    disasterType: DisasterType,
    countryCodeISO3: string,
  ): Promise<boolean> {
    let send = true;
    if (disasterType === DisasterType.Typhoon) {
      send = await this.typhoonTrackService.shouldSendNotification(
        countryCodeISO3,
        event.eventName,
      );
    } else if (disasterType === DisasterType.FlashFloods) {
      if (event.firstLeadTime === LeadTime.hour0) {
        send = false;
      }
    }
    return send;
  }
}
