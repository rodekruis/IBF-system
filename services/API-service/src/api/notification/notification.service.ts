import { Injectable } from '@nestjs/common';

import { EventSummaryCountry } from '../../shared/data.model';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster-type/disaster-type.enum';
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
    lastUploadTimestamp: Date,
  ): Promise<void | NotificationApiTestResponseDto> {
    const response = new NotificationApiTestResponseDto();
    const activeEventsResponse = await this.sendNotificationsActiveEvents(
      disasterType,
      countryCodeISO3,
      isApiTest,
      lastUploadTimestamp,
    );
    if (isApiTest && activeEventsResponse) {
      response.activeEvents = activeEventsResponse;
    }

    // NOTE: the finished event email is currently broken. It needs to be fixed. See AB#31766.
    // if (disasterType === DisasterType.Floods) {
    //   // Sending finished events is now for floods only
    //   const finishedEventsResponse = await this.sendNotificationsFinishedEvents(
    //     countryCodeISO3,
    //     disasterType,
    //     isApiTest,
    //     lastUploadTimestamp,
    //   );
    //   if (isApiTest && finishedEventsResponse) {
    //     response.finishedEvents = finishedEventsResponse;
    //   }
    // }

    if (isApiTest) {
      return response;
    }
  }

  private async sendNotificationsActiveEvents(
    disasterType: DisasterType,
    countryCodeISO3: string,
    isApiTest: boolean,
    lastUploadTimestamp: Date,
  ): Promise<void | NotificationApiTestResponseChannelDto> {
    const response = new NotificationApiTestResponseChannelDto();

    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disasterType,
    );
    const activeNotifiableEvents: EventSummaryCountry[] = [];
    for await (const event of events) {
      if (
        await this.isNotifiableActiveEvent(
          event,
          disasterType,
          countryCodeISO3,
          lastUploadTimestamp,
        )
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
        lastUploadTimestamp,
      );
      if (isApiTest && messageForApiTest) {
        response.email = messageForApiTest;
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
      return response;
    }
  }

  private async sendNotificationsFinishedEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    isApiTest: boolean,
    lastUploadTimestamp: Date,
  ): Promise<void | NotificationApiTestResponseChannelDto> {
    const response = new NotificationApiTestResponseChannelDto();
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
        lastUploadTimestamp,
      );
      if (isApiTest && emailFinished) {
        response.email = emailFinished;
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
        return response;
      }
    }
  }

  private async isNotifiableActiveEvent(
    event: EventSummaryCountry,
    disasterType: DisasterType,
    countryCodeISO3: string,
    lastUploadTimestamp: Date,
  ): Promise<boolean> {
    let send = true;
    if (disasterType === DisasterType.Typhoon) {
      send = await this.typhoonTrackService.shouldSendNotification(
        countryCodeISO3,
        event.eventName,
      );
    } else if (disasterType === DisasterType.FlashFloods) {
      if (event.firstLeadTime === LeadTime.hour0) {
        // For ongoing events only send an email - once - if the event starts as ongoing
        if (event.startDate !== lastUploadTimestamp.toISOString()) {
          send = false;
        }
      }
    }
    return send;
  }
}
