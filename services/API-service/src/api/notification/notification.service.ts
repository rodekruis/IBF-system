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
    // REFACTOR: First close finished events. This is ideally done through separate endpoint called at end of pipeline, but that would require all pipelines to be updated.
    // Instead, making use of this endpoint which is already called at the end of every pipeline
    await this.eventService.closeEventsAutomatic(countryCodeISO3, disasterType);

    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disasterType,
    );

    const activeEvents: EventSummaryCountry[] = [];
    let finishedEvent: EventSummaryCountry; // This is now for floods only, so can only be 1 event, so not an array
    for await (const event of events) {
      if (
        await this.getNotifiableActiveEvent(
          event,
          disasterType,
          countryCodeISO3,
        )
      ) {
        activeEvents.push(event);
      } else if (this.getFinishedEvent(event, disasterType, date)) {
        finishedEvent = event;
      }
    }
    if (activeEvents.length) {
      const country =
        await this.notificationContentService.getCountryNotificationInfo(
          countryCodeISO3,
        );
      // this.emailService.sendTriggerEmail(
      //   country,
      //   disasterType,
      //   activeEvents,
      //   date,
      // );

      if (country.notificationInfo.useWhatsapp[disasterType]) {
        this.whatsappService.sendTriggerWhatsapp(
          country,
          activeEvents,
          disasterType,
        );
      }
    }

    if (finishedEvent) {
      const country =
        await this.notificationContentService.getCountryNotificationInfo(
          countryCodeISO3,
        );

      this.emailService.sendTriggerFinishedEmail(
        country,
        disasterType,
        finishedEvent,
        date,
      );

      if (country.notificationInfo.useWhatsapp[disasterType]) {
        this.whatsappService.sendTriggerFinishedWhatsapp(
          country,
          finishedEvent,
          disasterType,
        );
      }
    }
  }

  private getFinishedEvent(
    event: EventSummaryCountry,
    disasterType: DisasterType,
    uploadDate?: Date,
  ) {
    // For now only do this for floods
    if (disasterType === DisasterType.Floods) {
      const date = uploadDate ? new Date(uploadDate) : new Date();
      const yesterdayActiveDate = new Date(date.setDate(date.getDate() + 6)); // determine yesterday still active events by endDate lying (7 - 1) days in the future
      if (
        new Date(event.endDate) >=
        new Date(yesterdayActiveDate.setHours(0, 0, 0, 0))
      ) {
        return true;
      }
    }
    return false;
  }

  private async getNotifiableActiveEvent(
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
