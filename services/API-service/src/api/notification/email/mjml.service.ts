import { Injectable } from '@nestjs/common';

import mjml2html from 'mjml';

import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import { EmailTemplateService } from './email-template.service';
import { getMjmlHeader } from './mjml/header';
import { getMjmlNotificationAction } from './mjml/notification-actions';

@Injectable()
export class MjmlService {
  public constructor(private emailTemplateService: EmailTemplateService) {}

  public getHtmlOutput({
    emailContent,
    date,
  }: {
    emailContent: ContentEventEmail;
    date: Date;
  }): string {
    const {
      // disasterType,
      disasterTypeLabel,
      // indicatorMetadata,
      // linkEapSop,
      // dataPerEvent,
      // mapImageData,
      // defaultAdminLevel,
      // defaultAdminAreaLabel,
      // country,
    } = emailContent;

    const header = getMjmlHeader({
      disasterTypeLabel,
      nrOfEvents: emailContent.dataPerEvent.length,
      sentOnDate: date.toISOString(),
      timeZone: 'UTC',
    });

    const bodyEventList =
      this.emailTemplateService.getMjmlEventListBody(emailContent);

    const notificationAction = getMjmlNotificationAction({
      linkDashboard: process.env.DASHBOARD_URL,
      linkEapSop: emailContent.linkEapSop,
      socialMediaLink:
        emailContent.country.notificationInfo.linkSocialMediaUrl ?? '',
      socialMediaType:
        emailContent.country.notificationInfo.linkSocialMediaType ?? '',
    });

    const emailObject = {
      tagName: 'mjml',
      attributes: {},
      children: [
        {
          tagName: 'mj-body',
          children: [header, ...bodyEventList, notificationAction],
        },
      ],
    };

    return mjml2html(emailObject).html;
  }
}
