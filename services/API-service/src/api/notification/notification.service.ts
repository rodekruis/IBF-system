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
    for await (const event of events) {
      if (
        await this.shouldSendNotification(event, disasterType, countryCodeISO3)
      ) {
        activeEvents.push(event);
      }
    }

    if (activeEvents.length) {
      const country = await this.notificationContentService.getCountryNotificationInfo(
        countryCodeISO3,
      );
      this.emailService.prepareAndSendEmail(
        country,
        disasterType,
        activeEvents,
      );

      if (country.notificationInfo.useWhatsapp) {
        this.whatsappService.sendTriggerViaWhatsapp(
          country,
          disasterType,
          activeEvents,
        );
      }
    } else {
      console.log(
        'No notifications sent, as there is no event that satifies notification thresholds',
      );
    }
  }

  private async shouldSendNotification(
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
