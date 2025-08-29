import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { formatISO } from 'date-fns';
import * as fs from 'fs';
import Mailchimp from 'mailchimp-api-v3';

import { CI, DEV, PROD } from '../../config';
import { Event } from '../../shared/data.model';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../event/dto/last-upload-date.dto';
import { LoginDto } from '../login/login.dto';
import { MjmlService } from '../notification/email/mjml.service';
import { NotificationContentService } from '../notification/notification-content/notification-content.service';
import { CountryEntity } from './../country/country.entity';

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
  private fromEmail = process.env.SUPPORT_EMAIL_ADDRESS;
  private fromEmailName = 'IBF portal';

  private mailchimp = new Mailchimp(process.env.MC_API);

  public constructor(
    private readonly notificationContentService: NotificationContentService,
    private readonly mjmlService: MjmlService,
    private readonly mailerService: MailerService,
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
    if (!PROD) {
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
    if (DEV) {
      fs.writeFileSync(
        `email-${countryCodeISO3}-${disasterType}-${subject}-${formatISO(new Date())}.html`,
        emailHtml,
      );
    }

    if (noNotifications || CI) {
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

  public async sendLoginCodeEmail({ email: to, code }: LoginDto) {
    let subject = `IBF - ${code} is your login code`;
    if (!PROD) {
      subject += ` - ${process.env.NODE_ENV.toUpperCase()}`;
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text: `IBF - ${code} is your login code`,
        template: 'login-code',
        context: {
          to,
          code,
          dashboardUrl: process.env.DASHBOARD_URL,
          supportEmailAddress: process.env.SUPPORT_EMAIL_ADDRESS,
        },
      });
    } catch (error: unknown) {
      this.logger.error('Error sending email:', error);
      throw new ServiceUnavailableException(error);
    }
  }
}
