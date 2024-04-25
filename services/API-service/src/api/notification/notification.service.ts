import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { NotificationContentService } from './notification-content/notification-content.service';
import { EmailService } from './email/email.service';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import { EventSummaryCountry } from '../../shared/data.model';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';

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
    date?: Date,
  ): Promise<void> {
    await this.sendNotiFicationsActiveEvents(
      disasterType,
      countryCodeISO3,
      date,
    );

    if (disasterType === DisasterType.Floods) {
      // Sending finished events is now for floods only
      await this.sendNotificationsFinishedEvents(
        countryCodeISO3,
        disasterType,
        date,
      );
    }

    // REFACTOR: First close finished events. This is ideally done through separate endpoint called at end of pipeline, but that would require all pipelines to be updated.
    // Instead, making use of this endpoint which is already called at the end of every pipeline
    await this.eventService.closeEventsAutomatic(countryCodeISO3, disasterType);
  }

  private async sendNotiFicationsActiveEvents(
    disasterType: DisasterType,
    countryCodeISO3: string,
    date?: Date,
  ): Promise<void> {
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
      await this.emailService.sendTriggerEmail(
        country,
        disasterType,
        activeNotifiableEvents,
        date,
      );
      if (country.notificationInfo.useWhatsapp[disasterType]) {
        this.whatsappService.sendTriggerWhatsapp(
          country,
          activeNotifiableEvents,
          disasterType,
        );
      }
    }
  }

  private async sendNotificationsFinishedEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    date?: Date,
  ): Promise<void> {
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

      await this.emailService.sendTriggerFinishedEmail(
        country,
        disasterType,
        finishedNotifiableEvents,
        date,
      );

      if (country.notificationInfo.useWhatsapp[disasterType]) {
        // TODO: Send one whatsapp message for all closing events
        for (const event of finishedNotifiableEvents) {
          await this.whatsappService.sendTriggerFinishedWhatsapp(
            country,
            event,
            disasterType,
          );
        }
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
