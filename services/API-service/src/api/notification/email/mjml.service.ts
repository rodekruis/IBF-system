import { Injectable } from '@nestjs/common';

import mjml2html from 'mjml';

import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import {
  COLOR_GREY,
  getReturnElement,
  getTextElement,
  WIDTH_BODY,
} from '../helpers/mjml.helper';
import { getMjmlEventListBody } from './mjml/body-event';
import { getMjmlAdminAreaTableList } from './mjml/event-admin-area-table';
import { getMjmlEventFinished } from './mjml/event-finished';
import { getMjmlFooter } from './mjml/footer';
import { getMjmlHeader } from './mjml/header';
import { getMjmlMapImages } from './mjml/map-image';
import { getMjmlNotificationAction } from './mjml/notification-actions';
import { getMjmlTriggerStatement } from './mjml/trigger-statement';

@Injectable()
export class MjmlService {
  private mailOpening = getReturnElement({
    childrenEls: [
      getTextElement({
        content: 'Dear Reader,',
      }),
    ],
  });

  private header = ({
    emailContent,
    date,
  }: {
    emailContent: ContentEventEmail;
    date: Date;
  }) =>
    getMjmlHeader({
      disasterTypeLabel: emailContent.disasterTypeLabel,
      nrOfEvents: emailContent.dataPerEvent.length,
      sentOnDate: date.toISOString(),
      timeZone: 'UTC',
      logosSrc:
        emailContent.country.notificationInfo.logo[emailContent.disasterType],
    });

  private footer = ({ countryName }: { countryName: string }) =>
    getMjmlFooter({ countryName });

  private notificationAction = ({
    linkDashboard,
    linkEapSop,
    socialMediaLink,
    socialMediaType,
  }: {
    linkDashboard: string;
    linkEapSop: string;
    socialMediaLink: string;
    socialMediaType: string;
  }) =>
    getMjmlNotificationAction({
      linkDashboard,
      linkEapSop,
      socialMediaLink,
      socialMediaType,
    });

  private mailBody = {
    tagName: 'mj-section',
    children: [],
    attributes: {
      'background-color': COLOR_GREY,
      'padding-left': '90px',
      'padding-right': '90px',
    },
  };

  public getTriggerEmailHtmlOutput({
    emailContent,
    date,
  }: {
    emailContent: ContentEventEmail;
    date: Date;
  }): string {
    const children = [];

    children.push(this.header({ emailContent, date }));

    this.mailBody.children.push(this.mailOpening);

    this.mailBody.children.push(...getMjmlEventListBody(emailContent));

    this.mailBody.children.push(
      this.notificationAction({
        linkDashboard: process.env.DASHBOARD_URL,
        linkEapSop: emailContent.linkEapSop,
        socialMediaLink:
          emailContent.country.notificationInfo.linkSocialMediaUrl ?? '',
        socialMediaType:
          emailContent.country.notificationInfo.linkSocialMediaType ?? '',
      }),
    );

    this.mailBody.children.push(
      getMjmlTriggerStatement({
        triggerStatement:
          emailContent.country.notificationInfo.triggerStatement[
            emailContent.disasterType
          ],
      }),
    );

    this.mailBody.children.push(...getMjmlMapImages(emailContent));

    this.mailBody.children.push(...getMjmlAdminAreaTableList(emailContent));

    this.mailBody.children.push(
      this.footer({ countryName: emailContent.country.countryName }),
    );

    children.push(this.mailBody);

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

  public getEventFinishedEmailHtmlOutput({
    emailContent,
    date,
  }: {
    emailContent: ContentEventEmail;
    date: Date;
  }): string {
    const children = [];

    children.push(this.header({ emailContent, date }));

    this.mailBody.children.push(this.mailOpening);

    this.mailBody.children.push(
      getMjmlEventFinished({
        disasterTypeLabel: emailContent.disasterTypeLabel,
        eventName: emailContent.dataPerEvent[0].eventName,
        issuedDate: emailContent.dataPerEvent[0].issuedDate,
        timezone: 'UTC',
      }),
    );

    this.mailBody.children.push(
      this.notificationAction({
        linkDashboard: process.env.DASHBOARD_URL,
        linkEapSop: emailContent.linkEapSop,
        socialMediaLink:
          emailContent.country.notificationInfo.linkSocialMediaUrl ?? '',
        socialMediaType:
          emailContent.country.notificationInfo.linkSocialMediaType ?? '',
      }),
    );

    this.mailBody.children.push(
      this.footer({ countryName: emailContent.country.countryName }),
    );

    children.push(this.mailBody);

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
