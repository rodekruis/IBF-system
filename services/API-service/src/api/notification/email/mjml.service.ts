import { Injectable } from '@nestjs/common';

import mjml2html from 'mjml';

import { HelperService } from '../../../shared/helper.service';
import { firstCharOfWordsToUpper } from '../../../shared/utils';
import { ContentEventEmail } from '../dto/content-event-email.dto';
import {
  BODY_WIDTH,
  EMAIL_HEAD,
  getFormattedDate,
  getSectionElement,
  getTextElement,
  getTimezoneDisplay,
} from '../helpers/mjml.helper';
import { NotificationContentService } from '../notification-content/notification-content.service';
import { getMjmlEventListBody } from './mjml/body-event';
import {
  getMjmlAdminAreaDisclaimer,
  getMjmlAdminAreaTableList,
} from './mjml/event-admin-area-table';
import { getMjmlFinishedEvents } from './mjml/event-finished';
import { getIbfFooter, getMailchimpFooter } from './mjml/footer';
import { getMjmlHeader } from './mjml/header';
import { getMjmlNotificationAction } from './mjml/notification-actions';
import { getMjmlTriggerStatement } from './mjml/trigger-statement';

@Injectable()
export class MjmlService {
  public constructor(
    private helperService: HelperService,
    private notificationContentService: NotificationContentService,
  ) {}

  private mailOpening = getSectionElement({
    childrenEls: [getTextElement({ content: 'Dear reader,' })],
    attributes: { padding: '16px 8px 8px' },
  });

  private header = ({
    emailContent,
    date,
  }: {
    emailContent: ContentEventEmail;
    date: Date;
  }) =>
    getMjmlHeader({
      disasterTypeLabel: firstCharOfWordsToUpper(
        emailContent.disasterType.label,
      ),
      eventCount: emailContent.events.length,
      sentOnDate: getFormattedDate({ date }),
      logosSrc:
        emailContent.country.notificationInfo.logo[
          emailContent.disasterType.disasterType
        ],
    });

  private footer = ({ countryName }: { countryName: string }) => [
    getIbfFooter({ countryName }),
    getMailchimpFooter(),
  ];

  private notificationAction = ({
    linkDashboard,
    eapLink,
    socialMediaLink,
    socialMediaType,
  }: {
    linkDashboard: string;
    eapLink: string;
    socialMediaLink: string;
    socialMediaType: string;
  }) =>
    getMjmlNotificationAction({
      linkDashboard,
      eapLink,
      socialMediaLink,
      socialMediaType,
    });

  public async getActiveEventEmailHtmlOutput({
    emailContent,
    date,
  }: {
    emailContent: ContentEventEmail;
    date: Date;
  }) {
    const children = [];

    children.push(this.header({ emailContent, date }));

    children.push(this.mailOpening);

    children.push(
      ...(await getMjmlEventListBody(
        emailContent,
        this.notificationContentService.getEventTimeString.bind(
          this.notificationContentService,
        ),
      )),
    );

    children.push(
      this.notificationAction({
        linkDashboard: process.env.DASHBOARD_URL,
        eapLink: emailContent.eapLink,
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
            emailContent.disasterType.disasterType
          ],
      }),
    );

    children.push(
      getMjmlAdminAreaDisclaimer(),
      ...getMjmlAdminAreaTableList(
        emailContent,
        this.helperService.toCompactNumber,
      ),
    );

    children.push(
      ...this.footer({ countryName: emailContent.country.countryName }),
    );

    const emailObject = {
      tagName: 'mjml',
      attributes: {},
      children: [
        EMAIL_HEAD,
        {
          tagName: 'mj-body',
          children,
          attributes: { width: BODY_WIDTH, padding: '0 20px' },
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
        disasterType: emailContent.disasterType.disasterType,
        events: emailContent.events,
        timezone: getTimezoneDisplay(emailContent.country.countryCodeISO3),
      }),
    );

    children.push(
      this.notificationAction({
        linkDashboard: process.env.DASHBOARD_URL,
        eapLink: emailContent.eapLink,
        socialMediaLink:
          emailContent.country.notificationInfo.linkSocialMediaUrl ?? '',
        socialMediaType:
          emailContent.country.notificationInfo.linkSocialMediaType ?? '',
      }),
    );

    children.push(
      ...this.footer({ countryName: emailContent.country.countryName }),
    );

    const emailObject = {
      tagName: 'mjml',
      attributes: {},
      children: [
        EMAIL_HEAD,
        {
          tagName: 'mj-body',
          children,
          attributes: { width: BODY_WIDTH, padding: '0 20px' },
        },
      ],
    };

    return mjml2html(emailObject).html;
  }
}
