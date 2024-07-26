import { Injectable } from '@nestjs/common';

import mjml2html from 'mjml';

import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import { getMjmlHeader } from './mjml/header';

@Injectable()
export class MjmlService {
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

    // const bodyEventList =
    //   this.emailTemplateService.getMjmlEventListBody(emailContent);

    const emailObject = {
      tagName: 'mjml',
      attributes: {},
      children: [
        {
          tagName: 'mj-body',
          children: [
            {
              tagName: 'mj-column',
              children: [header],
            },
          ],
        },
      ],
    };

    return mjml2html(emailObject).html;
  }
}
