import { Injectable } from '@nestjs/common';
import { ContentTriggerEmail } from '../dto/content-trigger-email.dto';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../dto/notification-date-per-event.dto';
import * as ejs from 'ejs';
import * as fs from 'fs';
import { CountryTimeZoneMapping } from '../../country/country-time-zone-mapping';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { EventSummaryCountry } from '../../../shared/data.model';
import { CountryEntity } from '../../country/country.entity';

const emailFolder = './src/api/notification/email';
const emailTemplateFolder = `${emailFolder}/html`;
const emailIconFolder = `${emailFolder}/icons`;

class ReplaceKeyValue {
  replaceKey: string;
  replaceValue: string;
}

@Injectable()
export class EmailTemplateService {
  private placeholderToday = '(TODAY)';

  public createHtmlForTriggerEmail(
    contentForEmail: ContentTriggerEmail,
    date: Date,
  ): string {
    const replaceKeyValues = this.createReplaceKeyValuesTrigger(
      contentForEmail,
      date,
    );
    return this.formatEmail(replaceKeyValues);
  }

  // TODO REFACTOR this to use a DTO (ContentTriggerFinishedEmail) instead of multiple parameters
  public createHtmlForTriggerFinishedEmail(
    country: CountryEntity,
    disasterType: DisasterType,
    finishedEvent: EventSummaryCountry,
    disasterTypeLabel: string,
    date: Date,
  ): string {
    const replaceKeyValues = this.createReplaceKeyValuesTriggerFinished(
      country,
      disasterType,
      finishedEvent,
      disasterTypeLabel,
      date,
    );
    return this.formatEmail(replaceKeyValues);
  }

  private createReplaceKeyValuesTrigger(
    contentForEmail: ContentTriggerEmail,
    date: Date,
  ): ReplaceKeyValue[] {
    const country = contentForEmail.country;
    const disasterType = contentForEmail.disasterType;
    const keyValueReplaceList = [
      {
        replaceKey: 'emailBody',
        replaceValue: this.getEmailBody(false),
      },
      {
        replaceKey: 'headerEventOverview',
        replaceValue: this.getHeaderEventOverview(contentForEmail.dataPerEvent),
      },
      {
        replaceKey: 'socialMediaPart',
        replaceValue: this.getSocialMediaHtml(contentForEmail.country),
      },
      {
        replaceKey: 'tablesStacked',
        replaceValue: this.getTablesForEvents(contentForEmail),
      },
      {
        replaceKey: this.placeholderToday,
        replaceValue: date.toLocaleDateString('default', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
      {
        replaceKey: 'eventListBody',
        replaceValue: this.getEventListBody(contentForEmail),
      },
      {
        replaceKey: 'imgLogo',
        replaceValue: country.notificationInfo.logo[disasterType],
      },
      {
        replaceKey: 'triggerStatement',
        replaceValue: country.notificationInfo.triggerStatement[disasterType],
      },
      {
        replaceKey: 'mapImagePart',
        replaceValue: this.getMapImageHtml(contentForEmail),
      },
      {
        replaceKey: 'linkDashboard',
        replaceValue: process.env.DASHBOARD_URL,
      },
      {
        replaceKey: 'linkEapSop',
        replaceValue: country.countryDisasterSettings.find(
          (s) => s.disasterType === disasterType,
        ).eapLink,
      },
      {
        replaceKey: 'socialMediaLink',
        replaceValue: country.notificationInfo.linkSocialMediaUrl,
      },
      {
        replaceKey: 'socialMediaType',
        replaceValue: country.notificationInfo.linkSocialMediaType,
      },
      {
        replaceKey: 'disasterType',
        replaceValue: contentForEmail.disasterTypeLabel,
      },
      {
        replaceKey: 'videoPdfLinks',
        replaceValue: this.getVideoPdfLinks(
          country.notificationInfo.linkVideo,
          country.notificationInfo.linkPdf,
        ),
      },
    ];
    return keyValueReplaceList;
  }

  private createReplaceKeyValuesTriggerFinished(
    country: CountryEntity,
    disasterType: DisasterType,
    event: EventSummaryCountry,
    disasterTypeLabel: string,
    date: Date,
  ): ReplaceKeyValue[] {
    const keyValueReplaceList = [
      {
        replaceKey: 'emailBody',
        replaceValue: this.getEmailBody(true),
      },
      {
        replaceKey: 'headerEventOverview',
        replaceValue: '',
      },
      {
        replaceKey: 'imgLogo',
        replaceValue: country.notificationInfo.logo[disasterType],
      },
      {
        replaceKey: 'startDate',
        replaceValue: event.startDate,
      },
      {
        replaceKey: 'linkDashboard',
        replaceValue: process.env.DASHBOARD_URL,
      },
      {
        replaceKey: 'socialMediaPart',
        replaceValue: this.getSocialMediaHtml(country),
      },
      {
        replaceKey: 'linkEapSop',
        replaceValue: country.countryDisasterSettings.find(
          (s) => s.disasterType === disasterType,
        ).eapLink,
      },
      {
        replaceKey: 'socialMediaLink',
        replaceValue: country.notificationInfo.linkSocialMediaUrl,
      },
      {
        replaceKey: 'socialMediaType',
        replaceValue: country.notificationInfo.linkSocialMediaType,
      },
      {
        replaceKey: 'videoPdfLinks',
        replaceValue: this.getVideoPdfLinks(
          country.notificationInfo.linkVideo,
          country.notificationInfo.linkPdf,
        ),
      },
      {
        replaceKey: 'disasterType',
        replaceValue: disasterTypeLabel,
      },
      {
        replaceKey: this.placeholderToday,
        replaceValue: date.toLocaleDateString('default', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
    ];
    return keyValueReplaceList;
  }

  private getEmailBody(triggerFinished: boolean): string {
    if (triggerFinished) {
      return fs.readFileSync(
        './src/api/notification/email/html/trigger-finished.html',
        'utf8',
      );
    } else {
      return fs.readFileSync(
        './src/api/notification/email/html/trigger-notification.html',
        'utf8',
      );
    }
  }

  private getHeaderEventOverview(
    eventsData: NotificationDataPerEventDto[],
  ): string {
    const leadTimeListShort = this.getEventListShort(eventsData);
    let headerEventOverview = fs.readFileSync(
      './src/api/notification/email/html/header-event-overview.html',
      'utf8',
    );
    headerEventOverview = ejs.render(headerEventOverview, {
      eventListHeader: leadTimeListShort,
    });
    return headerEventOverview;
  }

  private getVideoPdfLinks(videoLink: string, pdfLink: string) {
    // TODO: Use ejs template
    const linkVideoHTML = `
                    <a
                        href="${videoLink}"
                        title="Video instructions"
                        target="_blank"
                        style="
                        font-size: 14px;
                        font-family: Helvetica,
                            Arial,
                            sans-serif;
                        font-weight: bold;
                        color: #0c0c0c;
                        display: inline-block;
                    " >video</a>`;

    const linkPdfHTML = `<a href="${pdfLink}"
                        target="_blank"
                        title="PDF instructions"
                        style="
                        font-size: 14px;
                        font-family: Helvetica,
                            Arial,
                            sans-serif;
                        font-weight: bold;
                        color: #0c0c0c;
                        display: inline-block;
                        "  >PDF</a>`;
    let videoStr = '';
    if (videoLink) {
      videoStr = ' ' + linkVideoHTML;
    }
    let pdfStr = '';
    if (pdfLink) {
      pdfStr = ' ' + linkPdfHTML;
    }
    let orStr = '';
    if (videoStr && pdfStr) {
      orStr = ' or';
    }
    if (videoStr || pdfStr) {
      return `See instructions for the IBF-portal in${videoStr}${orStr}${pdfStr}.`;
    }
  }

  private getSocialMediaHtml(country: CountryEntity): string {
    if (country.notificationInfo.linkSocialMediaType) {
      return fs.readFileSync(
        './src/api/notification/email/html/social-media-link.html',
        'utf8',
      );
    } else {
      return '';
    }
  }

  private getMapImageHtml(contentForEmail: ContentTriggerEmail): string {
    let html = '';
    for (const event of contentForEmail.dataPerEvent) {
      const mapImage = event.mapImage;
      if (mapImage) {
        let eventHtml = fs.readFileSync(
          './src/api/notification/email/html/map-image.html',
          'utf8',
        );
        const replacements = {
          mapImgSrc: this.getMapImgSrc(
            contentForEmail.country.countryCodeISO3,
            contentForEmail.disasterType,
            event.eventName,
          ),
          mapImgDescription: this.getMapImageDescription(
            contentForEmail.disasterType,
          ),
          eventName: event.eventName ? ` for '${event.eventName}'` : '',
        };
        eventHtml = ejs.render(eventHtml, replacements);
        html += eventHtml;
      }
    }
    return html;
  }

  private getMapImgSrc(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
  ): string {
    const src = `${
      process.env.NG_API_URL
    }/event/event-map-image/${countryCodeISO3}/${disasterType}/${
      eventName || 'no-name'
    }`;

    return src;
  }

  private getMapImageDescription(disasterType: DisasterType): string {
    switch (disasterType) {
      case DisasterType.Floods:
        return 'The triggered areas are outlined in purple. The potential flood extent is shown in red.<br>';
      default:
        return '';
    }
  }

  private formatEmail(emailKeyValueReplaceList: ReplaceKeyValue[]): string {
    let template = fs.readFileSync(
      './src/api/notification/email/html/base.html',
      'utf8',
    );
    const replacements = emailKeyValueReplaceList.reduce(
      (acc, { replaceKey, replaceValue }) => {
        acc[replaceKey] = replaceValue;
        return acc;
      },
      {},
    );

    let emailHtml = template;
    let previousHtml = null;

    // This loop is needed to handle nested EJS tags. It repeatedly renders the template
    // until there are no more EJS tags left to render. This is necessary because EJS
    // doesn't render nested tags in one pass.
    while (emailHtml !== previousHtml) {
      previousHtml = emailHtml;
      emailHtml = ejs.render(previousHtml, replacements);
    }

    return emailHtml;
  }

  // TODO refactor this to use ejs package to render the html
  private getEventListShort(
    dataPerEvent: NotificationDataPerEventDto[],
  ): string {
    let text = '';
    for (const event of dataPerEvent) {
      const leadTimeString = event.disasterSpecificCopy.leadTimeString
        ? event.disasterSpecificCopy.leadTimeString
        : event.firstLeadTime;
      const timestamp = event.disasterSpecificCopy.timestamp
        ? ` at ${event.disasterSpecificCopy.timestamp}`
        : '';
      text += `${event.triggerStatusLabel} for ${event.eventName}: ${
        event.disasterSpecificCopy.extraInfo ||
        event.firstLeadTime === LeadTime.hour0
          ? leadTimeString
          : `${event.firstLeadTime}${timestamp}`
      }<br />`;
    }
    return text;
  }

  private getTablesForEvents(emailContent: ContentTriggerEmail): string {
    const adminAreaLabelsParent =
      emailContent.country.adminRegionLabels[
        String(emailContent.defaultAdminLevel - 1)
      ];

    return emailContent.dataPerEvent
      .map((event) => {
        const data = {
          hazard: emailContent.disasterTypeLabel,
          triggerStatusLabel: event.triggerStatusLabel,
          eventName: event.eventName,
          expectedTriggerDate: event.firstLeadTime,
          expectedExposedAdminBoundary: event.nrOfTriggeredAreas,
          defaulAdminAreaLabelSingular:
            emailContent.defaultAdminAreaLabel.singular,
          defaulAdminAreaLabelPlural:
            emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),
          defaultAdminAreaLabelParent: adminAreaLabelsParent.singular,
          indicatorLabel: emailContent.indicatorMetadata.label,
          indicatorUnit: emailContent.indicatorMetadata.unit,
          triangleIcon: this.getTriangleIcon(event.triggerStatusLabel),
          tableRows: this.getTablesRows(event),
          color:
            event.triggerStatusLabel === TriggerStatusLabelEnum.Trigger
              ? '#940000'
              : '#da7c00',
        };

        const templatePath = `${emailTemplateFolder}/email-table-event.html`;

        let template = fs.readFileSync(templatePath, 'utf8');

        const result = ejs.render(template, data);
        return result;
      })
      .join('');
  }

  private getTablesRows(event: NotificationDataPerEventDto) {
    return event.triggeredAreas
      .map((area) => {
        const areaTemplatePath =
          TriggerStatusLabelEnum.Trigger === event.triggerStatusLabel
            ? `${emailTemplateFolder}/email-table-trigger-row.html`
            : `${emailTemplateFolder}//email-table-warning-row.html`;
        const areaTemplate = fs.readFileSync(areaTemplatePath, 'utf8');
        const areaData = {
          affectectedOfIndicator: area.actionsValue,
          adminBoundary: area.displayName ? area.displayName : area.name,
          higherAdminBoundary: area.nameParent,
        };

        return ejs.render(areaTemplate, areaData);
      })
      .join('');
  }

  private getEventListBody(emailContent: ContentTriggerEmail): string {
    return emailContent.dataPerEvent
      .map((event) => {
        const data = {
          hazard: emailContent.disasterTypeLabel,
          triggerStatusLabel: event.triggerStatusLabel,
          eventName: event.eventName,
          level: event.disasterSpecificCopy.eventStatus,
          expectedWarningDate: event.disasterSpecificCopy.leadTimeString,
          nrOfTriggeredAreas: event.nrOfTriggeredAreas,
          expectedTriggerDate: event.firstLeadTime,
          expectedExposedAdminBoundary: event.nrOfTriggeredAreas,
          issuedDate: event.disasterSpecificCopy.timestamp,
          startDateEventString: event.startDateEventString,
          defaulAdminAreaLabel:
            emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),
          indicatorLabel: emailContent.indicatorMetadata.label,
          totalAffectectedOfIndicator: event.totalAffectectedOfIndicator,
          indicatorUnit: emailContent.indicatorMetadata.unit,
          currentDate: this.getCurrentDateTimeString(
            emailContent.country.countryCodeISO3,
          ),
          timezone:
            CountryTimeZoneMapping[emailContent.country.countryCodeISO3],
          triangleIcon: this.getTriangleIcon(event.triggerStatusLabel),
          leadTime: event.firstLeadTime.replace('-', ' '),
        };

        const templatePath =
          TriggerStatusLabelEnum.Trigger === event.triggerStatusLabel
            ? `${emailTemplateFolder}/email-body-trigger-event.html`
            : `${emailTemplateFolder}/email-body-warning-event.html`;

        let template = fs.readFileSync(templatePath, 'utf8');

        return ejs.render(template, data);
      })
      .join('');
  }

  private getCurrentDateTimeString(countryCodeISO3: string): string {
    const date = new Date();

    const timeZone = CountryTimeZoneMapping[countryCodeISO3];

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timeZone,
    };

    return date.toLocaleString('default', options);
  }

  private getTriangleIcon(triggerStatusLabel) {
    let fileName = '';
    // Still need implement the difference between medium and low warning
    if (triggerStatusLabel === TriggerStatusLabelEnum.Trigger) {
      fileName = 'trigger.png';
    } else {
      fileName = 'warning-medium.png';
    }
    const filePath = `${emailIconFolder}/${fileName}`;
    const imageDataURL = this.getPngImageAsDataURL(filePath);
    return imageDataURL;
  }

  private getPngImageAsDataURL(relativePath) {
    const imageBuffer = fs.readFileSync(relativePath);
    const imageDataURL = `data:image/png;base64,${imageBuffer.toString(
      'base64',
    )}`;

    return imageDataURL;
  }
}
