import { Injectable, Logger } from '@nestjs/common';

import { formatISO } from 'date-fns';
import * as fs from 'fs';
import Mailchimp from 'mailchimp-api-v3';

import { DEBUG } from '../../../config';
import { Event } from '../../../shared/data.model';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
import { CountryEntity } from './../../country/country.entity';
import { NotificationContentService } from './../notification-content/notification-content.service';
import { MjmlService } from './mjml.service';

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
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
    const segments: { [countryDisaster: string]: string } =
      process.env.MC_SEGMENTS.split(',').reduce((prev, curr) => {
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

    const emailHtml = this.mjmlService.getActiveEventEmailHtmlOutput({
      emailContent,
      date: lastUploadDate.timestamp,
    });

    let emailSubject = `IBF ${emailContent.disasterType.disasterType} alert`;
    if (process.env.NODE_ENV !== 'production') {
      emailSubject += ` - ${process.env.NODE_ENV.toUpperCase()}`;
    }

    return this.sendEmail(
      emailSubject,
      emailHtml,
      country.countryCodeISO3,
      disasterType,
      noNotifications,
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

    const emailSubject = `IBF ${disasterTypeLabel} ended`;

    return this.sendEmail(
      emailSubject,
      emailHtml,
      country.countryCodeISO3,
      disasterType,
      noNotifications,
    );
  }

  private sendEmail(
    subject: string,
    emailHtml: string,
    countryCodeISO3: string,
    disasterType: DisasterType,
    noNotifications: boolean,
  ) {
    // NOTE: use this to test the email output instead of using Mailchimp
    if (DEBUG) {
      fs.writeFileSync(
        `email-${countryCodeISO3}-${disasterType}-${subject}-${formatISO(new Date())}.html`,
        emailHtml,
      );
    }

    if (noNotifications || process.env.NODE_ENV === 'ci') {
      this.logger.log(
        `Email not sent for ${countryCodeISO3} - ${disasterType} - ${subject}`,
      );
      return emailHtml;
    }

    this.sendMailchimpCampaign(
      subject,
      emailHtml,
      countryCodeISO3,
      disasterType,
    );
  }

  private async sendMailchimpCampaign(
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

    try {
      const createResult = await this.mailchimp.post(
        '/campaigns',
        campaignBody,
      );

      await this.mailchimp.put(`/campaigns/${createResult.id}/content`, {
        html: emailHtml,
      });

      await this.mailchimp.post(`/campaigns/${createResult.id}/actions/send`);
    } catch (error: unknown) {
      this.logger.error(`Failed to send Mailchimp campaign. ${error}`);
    }
  }
}
