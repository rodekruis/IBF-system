import { Injectable } from '@nestjs/common';

import mjml2html from 'mjml';

import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import {
  EMAIL_HEAD,
  getFormattedDate,
  getSectionElement,
  getTextElement,
  getTimezoneDisplay,
} from '../helpers/mjml.helper';
import { getMjmlEventListBody } from './mjml/body-event';
import { getMjmlAdminAreaTableList } from './mjml/event-admin-area-table';
import { getMjmlFinishedEvents } from './mjml/event-finished';
import { getMjmlFooter } from './mjml/footer';
import { getMjmlHeader } from './mjml/header';
import { getMjmlMapImages } from './mjml/map-image';
import { getMjmlNotificationAction } from './mjml/notification-actions';
import { getMjmlTriggerStatement } from './mjml/trigger-statement';

@Injectable()
export class MjmlService {
  private mailOpening = getSectionElement({
    childrenEls: [
      getTextElement({
        content: 'Dear Reader,',
        attributes: { 'padding-top': '20px' },
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
      sentOnDate: getFormattedDate({ date }),
      timeZone: getTimezoneDisplay(emailContent.country.countryCodeISO3),
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

  public getTriggerEmailHtmlOutput({
    emailContent,
    date,
  }: {
    emailContent: ContentEventEmail;
    date: Date;
  }): string {
    const children = [];

    children.push(this.header({ emailContent, date }));

    children.push(this.mailOpening);

    children.push(...getMjmlEventListBody(emailContent));

    children.push(
      this.notificationAction({
        linkDashboard: process.env.DASHBOARD_URL,
        linkEapSop: emailContent.linkEapSop,
        socialMediaLink:
          emailContent.country.notificationInfo.linkSocialMediaUrl ?? '',
        socialMediaType:
          emailContent.country.notificationInfo.linkSocialMediaType ?? '',
      }),
    );

    children.push(
      getMjmlTriggerStatement({
        triggerStatement:
          emailContent.country.notificationInfo.triggerStatement[
            emailContent.disasterType
          ],
      }),
    );

    children.push(...getMjmlMapImages(emailContent));

    children.push(...getMjmlAdminAreaTableList(emailContent));

    children.push(
      this.footer({ countryName: emailContent.country.countryName }),
    );

    const emailObject = {
      tagName: 'mjml',
      attributes: {},
      children: [
        EMAIL_HEAD,
        {
          tagName: 'mj-body',
          children,
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

    children.push(this.mailOpening);

    children.push(
      ...getMjmlFinishedEvents({
        disasterType: emailContent.disasterTypeLabel,
        dataPerEvent: emailContent.dataPerEvent,
        timezone: getTimezoneDisplay(emailContent.country.countryCodeISO3),
      }),
    );

    children.push(
      this.notificationAction({
        linkDashboard: process.env.DASHBOARD_URL,
        linkEapSop: emailContent.linkEapSop,
        socialMediaLink:
          emailContent.country.notificationInfo.linkSocialMediaUrl ?? '',
        socialMediaType:
          emailContent.country.notificationInfo.linkSocialMediaType ?? '',
      }),
    );

    children.push(
      this.footer({ countryName: emailContent.country.countryName }),
    );

    const emailObject = {
      tagName: 'mjml',
      attributes: {},
      children: [
        EMAIL_HEAD,
        {
          tagName: 'mj-body',
          children,
          attributes: { padding: '0px 20px 0 20px' },
        },
      ],
    };

    return mjml2html(emailObject).html;
  }
}
