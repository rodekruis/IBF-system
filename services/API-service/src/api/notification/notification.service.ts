import { Injectable } from '@nestjs/common';

import { EventSummaryCountry } from '../../shared/data.model';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../event/dto/last-upload-date.dto';
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
    noNotifications: boolean,
    lastUploadDate: LastUploadDateDto,
  ): Promise<void | NotificationApiTestResponseDto> {
    const response = new NotificationApiTestResponseDto();
    const activeEventsResponse = await this.sendNotificationsActiveEvents(
      disasterType,
      countryCodeISO3,
      noNotifications,
      lastUploadDate,
    );
    if (noNotifications && activeEventsResponse) {
      response.activeEvents = activeEventsResponse;
    }

    // NOTE: the finished event email is currently broken. It needs to be fixed. See AB#31766.
    // When fixing this, also fix w.r.t. new Twilio Content API. See AB#34878.
    // if (disasterType === DisasterType.Floods) {
    //   // Sending finished events is now for floods only
    //   const finishedEventsResponse = await this.sendNotificationsFinishedEvents(
    //     countryCodeISO3,
    //     disasterType,
    //     noNotifications,
    //     lastUploadDate,
    //   );
    //   if (noNotifications && finishedEventsResponse) {
    //     response.finishedEvents = finishedEventsResponse;
    //   }
    // }

    if (noNotifications) {
      return response;
    }
  }

  private async sendNotificationsActiveEvents(
    disasterType: DisasterType,
    countryCodeISO3: string,
    noNotifications: boolean,
    lastUploadDate: LastUploadDateDto,
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
          lastUploadDate,
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
      const emailContent = await this.emailService.sendActiveEventsEmail(
        country,
        disasterType,
        activeNotifiableEvents,
        noNotifications,
        lastUploadDate,
      );
      if (noNotifications && emailContent) {
        response.email = emailContent;
      }
      if (
        !noNotifications &&
        country.notificationInfo.useWhatsapp[disasterType]
      ) {
        this.whatsappService.sendActiveEventsWhatsapp(
          country,
          activeNotifiableEvents,
          disasterType,
        );
      }
    }
    if (noNotifications) {
      return response;
    }
  }

  // private async sendNotificationsFinishedEvents(
  //   countryCodeISO3: string,
  //   disasterType: DisasterType,
  //   noNotifications: boolean,
  //   lastUploadDate: LastUploadDateDto,
  // ): Promise<void | NotificationApiTestResponseChannelDto> {
  //   const response = new NotificationApiTestResponseChannelDto();
  //   const finishedNotifiableEvents =
  //     await this.eventService.getEventsSummaryTriggerFinishedMail(
  //       countryCodeISO3,
  //       disasterType,
  //     );

  //   if (finishedNotifiableEvents.length > 0) {
  //     const country =
  //       await this.notificationContentService.getCountryNotificationInfo(
  //         countryCodeISO3,
  //       );

  //     const emailFinishedContent =
  //       await this.emailService.sendEventFinishedEmail(
  //         country,
  //         disasterType,
  //         finishedNotifiableEvents,
  //         noNotifications,
  //         lastUploadDate,
  //       );
  //     if (noNotifications && emailFinishedContent) {
  //       response.email = emailFinishedContent;
  //     }

  //     if (!noNotifications && country.notificationInfo.useWhatsapp[disasterType]) {
  //       for (const event of finishedNotifiableEvents) {
  //         await this.whatsappService.sendEventFinishedWhatsapp(
  //           country,
  //           event,
  //           disasterType,
  //         );
  //       }
  //     }
  //     if (noNotifications) {
  //       return response;
  //     }
  //   }
  // }

  private async isNotifiableActiveEvent(
    event: EventSummaryCountry,
    disasterType: DisasterType,
    countryCodeISO3: string,
    lastUploadDate: LastUploadDateDto,
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
        if (
          event.firstIssuedDate.getTime() !== lastUploadDate.timestamp.getTime()
        ) {
          send = false;
        }
      }
    }
    return send;
  }
}
