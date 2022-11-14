/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { NotificationContentService } from './notification-content/notification-content.service';
import { EmailService } from './email/email.service';

@Injectable()
export class NotificationService {
  public constructor(
    private readonly eventService: EventService,
    private readonly whatsappService: WhatsappService,
    private readonly emailService: EmailService,
    private readonly notificationContentService: NotificationContentService,
  ) {}

  public async send(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const events = await this.eventService.getEventSummaryCountry(
      countryCodeISO3,
      disasterType,
    );
    const activeEvents = events.filter(event => event.activeTrigger);
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
      console.log('No notifications sent, as there is no active event');
    }
  }
}
