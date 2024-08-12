import { Injectable } from '@nestjs/common';

import mjml2html from 'mjml';

import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import {
  getReturnElement,
  getTextElement,
  WIDTH_BODY,
} from '../helpers/mjml.helper';
import { EmailTemplateService } from './email-template.service';
import { getMjmlHeader } from './mjml/header';
import { getMjmlNotificationAction } from './mjml/notification-actions';
import { getMjmlTriggerStatement } from './mjml/trigger-statement';

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
    const children = [];

    children.push(
      getMjmlHeader({
        disasterTypeLabel: emailContent.disasterTypeLabel,
        nrOfEvents: emailContent.dataPerEvent.length,
        sentOnDate: date.toISOString(),
        timeZone: 'UTC',
      }),
    );

    const mailBody = {
      tagName: 'mj-section',
      children: [],
      attributes: {
        'background-color': '#F4F5F8',
        'padding-left': '90px',
        'padding-right': '90px',
      },
    };

    mailBody.children.push(
      getReturnElement({
        childrenEls: [
          getTextElement({
            content: 'Dear Reader,',
          }),
        ],
      }),
    );

    mailBody.children.push(
      ...this.emailTemplateService.getMjmlEventListBody(emailContent),
    );

    mailBody.children.push(
      getMjmlNotificationAction({
        linkDashboard: process.env.DASHBOARD_URL,
        linkEapSop: emailContent.linkEapSop,
        socialMediaLink:
          emailContent.country.notificationInfo.linkSocialMediaUrl ?? '',
        socialMediaType:
          emailContent.country.notificationInfo.linkSocialMediaType ?? '',
      }),
    );

    mailBody.children.push(
      getMjmlTriggerStatement({
        triggerStatement:
          emailContent.country.notificationInfo.triggerStatement[
            emailContent.disasterType
          ],
      }),
    );

    mailBody.children.push(
      ...this.emailTemplateService.getMjmlMapImages(emailContent),
    );

    mailBody.children.push(
      ...this.emailTemplateService.getMjmlAdminAreaTableList(emailContent),
    );

    children.push(mailBody);

    const emailObject = {
      tagName: 'mjml',
      attributes: {},
      children: [
        {
          tagName: 'mj-body',
          children,
          attributes: { width: WIDTH_BODY },
        },
      ],
    };

    return mjml2html(emailObject).html;
  }
}
