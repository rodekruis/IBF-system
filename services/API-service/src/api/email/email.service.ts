import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { formatISO } from 'date-fns';
import * as fs from 'fs';

import {
  CI,
  DASHBOARD_URL,
  DEV,
  PROD,
  SUPPORT_EMAIL_ADDRESS,
} from '../../config';
import { Event } from '../../shared/data.model';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../event/dto/last-upload-date.dto';
import { LoginDto } from '../login/login.dto';
import { MjmlService } from '../notification/email/mjml.service';
import { NotificationContentService } from '../notification/notification-content/notification-content.service';
import { UserService } from '../user/user.service';
import { CountryEntity } from './../country/country.entity';

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');

  public constructor(
    private readonly notificationContentService: NotificationContentService,
    private readonly mjmlService: MjmlService,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
  ) {}

  public async sendActiveEventsEmail(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: Event[],
    noNotifications: boolean,
    lastUploadDate: LastUploadDateDto,
  ): Promise<void | string> {
    const contentEventEmail =
      await this.notificationContentService.getContentActiveEvents(
        country,
        disasterType,
        activeEvents,
      );

    const html = await this.mjmlService.getActiveEventEmailHtmlOutput({
      contentEventEmail,
      date: lastUploadDate.timestamp,
    });

    const subject = `IBF ${contentEventEmail.disasterType.disasterType} alert`;

    return this.sendEventEmail(
      subject,
      html,
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

    const contentEventEmail =
      await this.notificationContentService.getContentActiveEvents(
        country,
        disasterType,
        finishedEvents,
      );

    const html = this.mjmlService.getEventFinishedEmailHtmlOutput({
      contentEventEmail,
      date: lastUploadDate.timestamp,
    });

    const subject = `IBF ${disasterTypeLabel} ended`;

    return this.sendEventEmail(
      subject,
      html,
      country.countryCodeISO3,
      disasterType,
      noNotifications,
    );
  }

  private async sendEventEmail(
    subject: string,
    html: string,
    countryCodeISO3: string,
    disasterType: DisasterType,
    noNotifications: boolean,
  ) {
    if (DEV) {
      // NOTE: use this to test the email output instead of sending an email
      fs.writeFileSync(
        `email-${countryCodeISO3}-${disasterType}-${subject}-${formatISO(new Date())}.html`,
        html,
      );
    }

    if (noNotifications || CI) {
      this.logger.log(
        `Email not sent for ${countryCodeISO3} - ${disasterType} - ${subject}`,
      );
      return html;
    }

    const users = await this.userService.findUsers(
      [countryCodeISO3],
      [disasterType],
    );

    const bcc = users.map(({ email }) => email);

    subject = this.getSubject(subject);

    try {
      await this.mailerService.sendMail({
        to: SUPPORT_EMAIL_ADDRESS,
        bcc,
        subject,
        text: subject,
        html,
      });
    } catch (error: unknown) {
      this.logger.error('Error sending email:', error);
      throw new ServiceUnavailableException(error);
    }
  }

  public async sendLoginCodeEmail({ email: to, code }: LoginDto) {
    let subject = `IBF - ${code} is your login code`;
    subject = this.getSubject(subject);

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text: subject,
        template: 'login-code',
        context: {
          to,
          code,
          dashboardUrl: DASHBOARD_URL,
          supportEmailAddress: SUPPORT_EMAIL_ADDRESS,
        },
      });
    } catch (error: unknown) {
      this.logger.error('Error sending email:', error);
      throw new ServiceUnavailableException(error);
    }
  }

  private getSubject(subject: string) {
    if (!PROD) {
      subject += ` - ${process.env.NODE_ENV.toUpperCase()}`;
    }
    return subject;
  }
}
