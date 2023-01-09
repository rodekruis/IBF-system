/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { NotificationContentService } from './notification-content/notification-content.service';
import { EmailService } from './email/email.service';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import { EventSummaryCountry } from '../../shared/data.model';

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
  ): Promise<void> {
    const events = await this.eventService.getEventSummaryCountry(
      countryCodeISO3,
      disasterType,
    );

    const activeEvents = [];
    const finishedEvents = [];
    for await (const event of events) {
      if (
        await this.getNotifiableActiveEvent(
          event,
          disasterType,
          countryCodeISO3,
        )
      ) {
        activeEvents.push(event);
      } else if (this.getFinishedEvent(event, disasterType)) {
        finishedEvents.push(event);
      }
    }
    if (activeEvents.length) {
      const country = await this.notificationContentService.getCountryNotificationInfo(
        countryCodeISO3,
      );
      this.emailService.sendTriggerEmail(country, disasterType, activeEvents);

      if (country.notificationInfo.useWhatsapp) {
        this.whatsappService.sendTriggerWhatsapp(
          country,
          disasterType,
          activeEvents,
        );
      }
    }

    if (finishedEvents.length > 0) {
      const country = await this.notificationContentService.getCountryNotificationInfo(
        countryCodeISO3,
      );

      this.emailService.sendTriggerFinishedEmail(
        country,
        disasterType,
        finishedEvents,
      );

      this.whatsappService.sendTriggerFinishedWhatsapp(country, finishedEvents);
    }
  }

  private getFinishedEvent(
    event: EventSummaryCountry,
    disasterType: DisasterType,
  ) {
    // For now only do this for floods
    if (disasterType === DisasterType.Floods) {
      const date = new Date();
      const yesterdayActiveDate = new Date(date.setDate(date.getDate() + 6)); // determine yesterday still active events by endDate lying (7 - 1) days in the future
      if (
        !event.activeTrigger &&
        new Date(event.endDate) >=
          new Date(yesterdayActiveDate.setHours(0, 0, 0, 0))
      ) {
        return true;
      }
    }
  }

  private async getNotifiableActiveEvent(
    event: EventSummaryCountry,
    disasterType: DisasterType,
    countryCodeISO3: string,
  ): Promise<boolean> {
    let send = event.activeTrigger;
    if (disasterType === DisasterType.Typhoon) {
      send = await this.typhoonTrackService.shouldSendNotification(
        countryCodeISO3,
        event.eventName,
      );
    }
    return send;
  }
}
