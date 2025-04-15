// import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

// import { formatISO } from 'date-fns';
import Mailchimp from 'mailchimp-api-v3';

import { Event } from '../../../shared/data.model';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
import { CountryEntity } from './../../country/country.entity';
import { NotificationContentService } from './../notification-content/notification-content.service';
import { MjmlService } from './mjml.service';

@Injectable()
export class EmailService {
  private fromEmail = process.env.SUPPORT_EMAIL_ADDRESS;
  private fromEmailName = 'IBF portal';

  private mailchimp = new Mailchimp(process.env.MC_API);

  public constructor(
    private readonly notificationContentService: NotificationContentService,
    private readonly mjmlService: MjmlService,
  ) {}

  private async getSegmentId(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<number> {
    const segments: {
      [countryDisaster: string]: string;
    } = process.env.MC_SEGMENTS.split(',').reduce((prev, curr) => {
      const segment = curr.split(':');
      return { ...prev, [segment[0]]: Number(segment[1]) };
    }, {});

    const countryDisaster = `${countryCodeISO3}_${disasterType}`;
    if (!segments || !segments[countryDisaster]) {
      return null;
    }

    return Number(segments[countryDisaster]);
  }

  public async sendActiveEventsEmail(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: Event[],
    noNotifications: boolean,
    lastUploadDate: LastUploadDateDto,
  ): Promise<void | string> {
    const emailContent =
      await this.notificationContentService.getContentActiveEvents(
        country,
        disasterType,
        activeEvents,
      );
    let emailHtml = '';

    emailHtml += this.mjmlService.getActiveEventEmailHtmlOutput({
      emailContent,
      date: lastUploadDate.timestamp,
    });

    if (noNotifications || process.env.NODE_ENV === 'ci') {
      // NOTE: use this to test the email output instead of using Mailchimp
      // fs.writeFileSync(
      //   `email-${country.countryCodeISO3}-${disasterType}-${formatISO(new Date())}.html`,
      //   emailHtml,
      // );
      return emailHtml;
    }
    let emailSubject = `IBF ${emailContent.disasterType.disasterType} alert`;
    if (process.env.NODE_ENV !== 'production') {
      emailSubject += ` - ${process.env.NODE_ENV.toUpperCase()}`;
    }
    this.sendEmail(
      emailSubject,
      emailHtml,
      country.countryCodeISO3,
      disasterType,
    );
  }

  public async sendEventFinishedEmail(
    country: CountryEntity,
    disasterType: DisasterType,
    finishedEvents: Event[],
    noNotifications: boolean,
    lastUploadDate: LastUploadDateDto,
  ): Promise<void | string> {
    const disasterTypeLabel =
      await this.notificationContentService.getDisasterTypeLabel(disasterType);

    const emailContent =
      await this.notificationContentService.getContentActiveEvents(
        country,
        disasterType,
        finishedEvents,
      );

    const emailHtml = this.mjmlService.getEventFinishedEmailHtmlOutput({
      emailContent,
      date: lastUploadDate.timestamp,
    });

    if (noNotifications || process.env.NODE_ENV === 'ci') {
      return emailHtml;
    }
    const emailSubject = `IBF ${disasterTypeLabel} ended`;
    this.sendEmail(
      emailSubject,
      emailHtml,
      country.countryCodeISO3,
      disasterType,
    );
  }

  private async sendEmail(
    subject: string,
    emailHtml: string,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const campaignBody = {
      settings: {
        title: new Date().toISOString(),
        subject_line: subject,
        from_name: this.fromEmailName,
        reply_to: this.fromEmail,
        auto_tweet: false,
      },
      recipients: {
        list_id: process.env.MC_LIST_ID,
        segment_opts: {
          saved_segment_id: await this.getSegmentId(
            countryCodeISO3,
            disasterType,
          ),
        },
      },
      type: 'regular',
    };
    const createResult = await this.mailchimp.post('/campaigns', campaignBody);

    const updateBody = {
      html: emailHtml,
    };
    await this.mailchimp.put(
      `/campaigns/${createResult.id}/content`,
      updateBody,
    );
    await this.mailchimp.post(`/campaigns/${createResult.id}/actions/send`);
  }
}
