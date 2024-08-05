import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

import * as ejs from 'ejs';
import * as juice from 'juice';

import {
  EapAlertClassKeyEnum,
  EventSummaryCountry,
  TriggeredArea,
} from '../../../shared/data.model';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryTimeZoneMapping } from '../../country/country-time-zone-mapping';
import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../dto/notification-date-per-event.dto';
import { getMjmlBodyEvent } from './mjml/body-event';
import { getMjmlEventAdminAreaTable } from './mjml/event-admin-area-table';

const emailFolder = './src/api/notification/email';
const emailTemplateFolder = `${emailFolder}/html`;
const emailIconFolder = `${emailFolder}/icons`;
const emailLogoFolder = `${emailFolder}/logos`;

@Injectable()
export class EmailTemplateService {
  public async createHtmlForTriggerEmail(
    emailContent: ContentEventEmail,
    date: Date,
  ): Promise<string> {
    const replaceKeyValues = this.createReplaceKeyValuesTrigger(
      emailContent,
      date,
    );
    return this.formatEmail(replaceKeyValues);
  }

  public async createHtmlForTriggerFinishedEmail(
    country: CountryEntity,
    disasterType: DisasterType,
    finishedEvents: EventSummaryCountry[],
    disasterTypeLabel: string,
    _date: Date, // I am not sure if this is needed and for what it was used before
  ): Promise<string> {
    const replaceKeyValues = this.createReplaceKeyValuesTriggerFinished(
      country,
      disasterType,
      finishedEvents,
      disasterTypeLabel,
    );
    return await this.formatEmail(replaceKeyValues);
  }

  private createReplaceKeyValuesTrigger(
    emailContent: ContentEventEmail,
    _date: Date,
  ): Record<string, string> {
    const country = emailContent.country;
    const disasterType = emailContent.disasterType;

    const keyValueReplaceObject = {
      emailBody: this.readHtmlFile('trigger-notification.html'),
      headerEventOverview: this.getHeaderEventStarted(emailContent),
      notificationActions: this.getNotificationActionsHtml(
        country,
        emailContent.linkEapSop,
      ),
      tablesStacked: this.getTablesForEvents(emailContent),
      eventListBody: this.getEventListBody(emailContent),
      imgLogo: country.notificationInfo.logo[disasterType],
      triggerStatement: country.notificationInfo.triggerStatement[disasterType],
      mapImagePart: this.getMapImageHtml(emailContent),
      linkDashboard: process.env.DASHBOARD_URL,
      socialMediaLink: country.notificationInfo.linkSocialMediaUrl,
      socialMediaType: country.notificationInfo.linkSocialMediaType,
      disasterType: emailContent.disasterType,
      disasterTypeLabel: emailContent.disasterTypeLabel,
      footer: this.getFooterHtml(country.countryName),
    };
    return keyValueReplaceObject;
  }

  private createReplaceKeyValuesTriggerFinished(
    country: CountryEntity,
    disasterType: DisasterType,
    events: EventSummaryCountry[],
    disasterTypeLabel: string,
  ): Record<string, string> {
    const keyValueReplaceObject = {
      emailBody: this.readHtmlFile('trigger-finished.html'),
      headerEventOverview: '',
      eventOverview: this.getEventsFinishedOverview(
        country,
        events,
        disasterTypeLabel,
      ),
      imgLogo: country.notificationInfo.logo[disasterType],
      linkDashboard: process.env.DASHBOARD_URL,
      socialMediaPart: this.getSocialMediaHtml(country),
      socialMediaLink: country.notificationInfo.linkSocialMediaUrl,
      socialMediaType: country.notificationInfo.linkSocialMediaType,
      disasterType: disasterType,
      disasterTypeLabel: disasterTypeLabel,
      footer: this.getFooterHtml(country.countryName),
    };
    return keyValueReplaceObject;
  }

  private getEventsFinishedOverview(
    country: CountryEntity,
    events: EventSummaryCountry[],
    disasterTypeLabel: string,
  ): string {
    const template = this.readHtmlFile('event-finished.html');
    return events
      .map((event) =>
        ejs.render(template, {
          disasterTypeLabel,
          eventName: event.eventName,
          issuedDate: this.dateObjectToDateTimeString(
            new Date(event.startDate),
            country.countryCodeISO3,
          ),
          timeZone: this.getTimezoneDisplay(country.countryCodeISO3),
        }),
      )
      .join('');
  }

  private getHeaderEventStarted(emailContent: ContentEventEmail): string {
    let headerEventOverview = this.readHtmlFile('header.html');
    headerEventOverview = ejs.render(headerEventOverview, {
      sentOnDate: this.getCurrentDateTimeString(
        emailContent.country.countryCodeISO3,
      ),
      disasterTypeLabel: emailContent.disasterTypeLabel,
      nrOfEvents: emailContent.dataPerEvent.length,
      timeZone: this.getTimezoneDisplay(emailContent.country.countryCodeISO3),
    });
    return headerEventOverview;
  }

  private getTimezoneDisplay = (countryCodeISO3: string) => {
    return CountryTimeZoneMapping[countryCodeISO3].split('_').join(' ');
  };

  private getNotificationActionsHtml(
    country: CountryEntity,
    linkEapSop: string,
  ): string {
    const socialMediaLinkHtml = this.getSocialMediaHtml(country);

    let html = this.readHtmlFile('notification-actions.html');
    const data = {
      linkDashboard: process.env.DASHBOARD_URL,
      linkEapSop: linkEapSop,
      socialMediaPart: socialMediaLinkHtml,
    };
    html = ejs.render(html, data);
    return html;
  }

  private getSocialMediaHtml(country: CountryEntity) {
    return country.notificationInfo.linkSocialMediaType
      ? this.readHtmlFile('social-media-link.html')
      : '';
  }

  private getMapImageHtml(emailContent: ContentEventEmail) {
    return emailContent.dataPerEvent
      .filter((event) => event.mapImage)
      .map((event) => {
        const eventHtmlTemplate = this.readHtmlFile('map-image.html');
        const replacements = {
          mapImgSrc: this.getMapImgSrc(
            emailContent.country.countryCodeISO3,
            emailContent.disasterType,
            event.eventName,
          ),
          mapImgDescription: this.getMapImageDescription(
            emailContent.disasterType,
          ),
          eventName: event.eventName ? `(for ${event.eventName})` : '',
        };
        return ejs.render(eventHtmlTemplate, replacements);
      })
      .join('');
  }

  private getMapImgSrc(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
  ) {
    return `${
      process.env.NG_API_URL
    }/event/event-map-image/${countryCodeISO3}/${disasterType}/${
      eventName || 'no-name'
    }`;
  }

  private getMapImageDescription(disasterType: DisasterType): string {
    const descriptions = {
      [DisasterType.Floods]:
        'The triggered areas are outlined in purple. The potential flood extent is shown in red.<br>',
    };

    return descriptions[disasterType] || '';
  }

  private async formatEmail(
    emailKeyValueReplaceObject: Record<string, string>,
  ): Promise<string> {
    // TODO REFACTOR: Apply styles in a separate file also for the base.html
    const template = this.readHtmlFile('base.html');
    const styles = this.readHtmlFile('styles.ejs');
    const templateWithStyle = styles + template;

    let emailHtml = templateWithStyle;
    let previousHtml = null;

    // This loop is needed to handle nested EJS tags. It repeatedly renders the template
    // until there are no more EJS tags left to render. This is necessary because EJS
    // doesn't render nested tags in one pass.
    while (emailHtml !== previousHtml) {
      previousHtml = emailHtml;
      emailHtml = ejs.render(previousHtml, emailKeyValueReplaceObject);
    }
    // Inline the CSS
    const inlinedHtml = await new Promise((resolve, reject) => {
      juice.juiceResources(emailHtml, { webResources: {} }, (err, html) => {
        if (err) {
          console.error('Error inlining CSS: ', err);
          reject(err);
        } else {
          resolve(html);
        }
      });
    });

    return inlinedHtml as string;
  }

  private getTablesForEvents(emailContent: ContentEventEmail): string {
    const adminAreaLabelsParent =
      emailContent.country.adminRegionLabels[
        String(Math.max(1, emailContent.defaultAdminLevel - 1))
      ];
    return emailContent.dataPerEvent
      .map((event) => {
        const data = {
          disasterTypeLabel: emailContent.disasterTypeLabel,
          triggerStatusLabel: event.triggerStatusLabel,
          eventName: event.eventName,
          defaultAdminAreaLabelSingular:
            emailContent.defaultAdminAreaLabel.singular,
          defaultAdminAreaLabelPlural:
            emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),
          defaultAdminAreaLabelParent: adminAreaLabelsParent.singular,
          indicatorLabel: emailContent.indicatorMetadata.label,
          triangleIcon: this.getTriangleIcon(
            event.eapAlertClass?.key,
            event.triggerStatusLabel,
          ),
          tableRows: this.getTablesRows(event),
          isIndicatorAvailable: this.isIndicatorAvailable(event.triggeredAreas),
          color: this.getIbfHexColor(
            event.eapAlertClass?.color,
            event.triggerStatusLabel,
          ),
          severityLabel: this.getEventSeverityLabel(event.eapAlertClass?.key),
        };

        const templateFileName = 'table-event.html';
        const template = this.readHtmlFile(templateFileName);

        const result = ejs.render(template, data);
        return result;
      })
      .join('');
  }

  private getEventSeverityLabel(
    eapAlertClassKey: EapAlertClassKeyEnum,
  ): string {
    const severityLabels = {
      [EapAlertClassKeyEnum.med]: 'Medium',
      [EapAlertClassKeyEnum.min]: 'Low',
    };

    return severityLabels[eapAlertClassKey] || '';
  }

  private isIndicatorAvailable(areas: TriggeredArea[]) {
    return areas.some((area) => area.actionsValue);
  }

  private getTablesRows(event: NotificationDataPerEventDto) {
    return event.triggeredAreas
      .filter((area) => area.actionsValue)
      .map((area) => {
        const areaTemplate = this.readHtmlFile('table-row.html');
        const areaData = {
          affectedOfIndicator: area.actionsValue,
          adminBoundary: area.displayName ? area.displayName : area.name,
          higherAdminBoundary: area.nameParent,
        };

        return ejs.render(areaTemplate, areaData);
      })
      .join('');
  }

  private getEventListBody(emailContent: ContentEventEmail): string {
    return emailContent.dataPerEvent
      .map((event) => {
        const data = {
          // Event details
          eventName: event.eventName,
          disasterTypeLabel: emailContent.disasterTypeLabel,
          triggerStatusLabel: event.triggerStatusLabel,
          issuedDate: this.dateObjectToDateTimeString(
            event.issuedDate,
            emailContent.country.countryCodeISO3,
          ),
          timeZone: this.getTimezoneDisplay(
            emailContent.country.countryCodeISO3,
          ),

          // Lead time details
          firstLeadTimeString: event.firstLeadTimeString,
          firstTriggerLeadTimeString: event.firstTriggerLeadTimeString,
          firstLeadTimeFromNow: this.getTimeFromNow(event.firstLeadTime),
          firstTriggerLeadTimeFromNow: this.getTimeFromNow(
            event.firstTriggerLeadTime,
          ),

          // Area details
          nrOfTriggeredAreas: event.nrOfTriggeredAreas,
          defaultAdminAreaLabel:
            emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),

          // Indicator details
          indicatorLabel: emailContent.indicatorMetadata.label,
          totalAffectedOfIndicator: event.totalAffectedOfIndicator,
          indicatorUnit: emailContent.indicatorMetadata.unit,
          totalAffected: this.getTotalAffectedHtml(
            event,
            emailContent.indicatorMetadata.label.toLowerCase(),
          ),

          // EAP details
          triangleIcon: this.getTriangleIcon(
            event.eapAlertClass?.key,
            event.triggerStatusLabel,
          ),
          leadTime: event.firstLeadTime.replace('-', ' '),
          disasterIssuedLabel: this.getDisasterIssuedLabel(
            event.eapAlertClass?.label,
            event.triggerStatusLabel,
          ),
          color: this.getIbfHexColor(
            event.eapAlertClass?.color,
            event.triggerStatusLabel,
          ),
          advisory: this.getAdvisoryHtml(
            event.triggerStatusLabel,
            emailContent.linkEapSop,
          ),
        };

        const templateFileName = 'body-event.html';
        const template = this.readHtmlFile(templateFileName);
        return ejs.render(template, data);
      })
      .join('');
  }

  public getMjmlEventListBody(emailContent: ContentEventEmail): object[] {
    const eventList = [];

    for (const event of emailContent.dataPerEvent) {
      eventList.push(
        getMjmlBodyEvent({
          eventName: event.eventName,

          disasterTypeLabel: emailContent.disasterTypeLabel,
          triggerStatusLabel: event.triggerStatusLabel,
          issuedDate: this.dateObjectToDateTimeString(
            event.issuedDate,
            emailContent.country.countryCodeISO3,
          ),
          timeZone: this.getTimezoneDisplay(
            emailContent.country.countryCodeISO3,
          ),

          // Lead time details
          firstLeadTimeString: event.firstLeadTimeString,
          firstTriggerLeadTimeString: event.firstTriggerLeadTimeString,
          firstLeadTimeFromNow: this.getTimeFromNow(event.firstLeadTime),
          firstTriggerLeadTimeFromNow: this.getTimeFromNow(
            event.firstTriggerLeadTime,
          ),

          // Area details
          nrOfTriggeredAreas: event.nrOfTriggeredAreas,
          defaultAdminAreaLabel:
            emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),

          // Indicator details
          indicatorLabel: emailContent.indicatorMetadata.label,
          totalAffected: this.getTotalAffectedForMjml(event),

          // EAP details
          triangleIcon: this.getTriangleIcon(
            event.eapAlertClass?.key,
            event.triggerStatusLabel,
          ),

          disasterIssuedLabel: this.getDisasterIssuedLabel(
            event.eapAlertClass?.label,
            event.triggerStatusLabel,
          ),
          color: this.getIbfHexColor(
            event.eapAlertClass?.color,
            event.triggerStatusLabel,
          ),

          indicatorUnit: emailContent.indicatorMetadata.unit,
        }),
      );
    }
    return eventList;
  }

  public getMjmlAdminAreaTableList(emailContent: ContentEventEmail): object[] {
    const adminAreaTableList = [];

    const adminAreaLabelsParent =
      emailContent.country.adminRegionLabels[
        String(Math.max(1, emailContent.defaultAdminLevel - 1))
      ];

    for (const event of emailContent.dataPerEvent) {
      adminAreaTableList.push(
        getMjmlEventAdminAreaTable({
          disasterTypeLabel: emailContent.disasterTypeLabel,
          color: this.getIbfHexColor(
            event.eapAlertClass?.color,
            event.triggerStatusLabel,
          ),
          defaultAdminAreaLabel: emailContent.defaultAdminAreaLabel,
          defaultAdminAreaParentLabel: adminAreaLabelsParent,
          indicatorMetadata: emailContent.indicatorMetadata,
          event,
        }),
      );
    }
    return adminAreaTableList;
  }

  private getTimeFromNow(leadTime: LeadTime) {
    if (!leadTime) return '';

    return [LeadTime.day0, LeadTime.month0, LeadTime.hour0].includes(leadTime)
      ? 'ongoing'
      : `${leadTime.replace('-', ' ')}s from now`;
  }

  private getDisasterIssuedLabel(
    eapLabel: string,
    triggerStatusLabel: TriggerStatusLabelEnum,
  ) {
    return eapLabel || triggerStatusLabel;
  }

  private getAdvisoryHtml(
    triggerStatusLabel: TriggerStatusLabelEnum,
    eapLink: string,
  ) {
    const fileName =
      triggerStatusLabel === TriggerStatusLabelEnum.Trigger
        ? 'advisory-trigger.html'
        : 'advisory-warning.html';
    const advisoryHtml = this.readHtmlFile(fileName);
    return ejs.render(advisoryHtml, { eapLink });
  }

  private getTotalAffectedHtml(
    event: NotificationDataPerEventDto,
    indicatorUnit: string,
  ): string {
    const fileName = event.totalAffectedOfIndicator
      ? 'body-total-affected-available.html'
      : 'body-total-affected-unavailable.html';
    const htmlTemplate = this.readHtmlFile(fileName);
    return ejs.render(htmlTemplate, {
      totalAffectedOfIndicator: event.totalAffectedOfIndicator,
      indicatorUnit: indicatorUnit,
    });
  }

  getTotalAffectedForMjml(event: NotificationDataPerEventDto): number | null {
    return event.totalAffectedOfIndicator ?? null;
  }

  private getIbfHexColor(
    color: string,
    triggerStatusLabel: TriggerStatusLabelEnum,
  ): string {
    const ibfOrange = '#aa6009';
    const ibfYellow = '#665606';
    const ibfRed = '#8a0f32';

    // Color  defined in the EAP Alert Class. This is only used for flood events
    // For other events, the color is defined in the disaster settings
    // So we decide it based on the trigger status label

    if (color) {
      // TODO: Define in a place where FrontEnd and Backend can share this
      switch (color) {
        case 'ibf-orange':
          return ibfOrange;
        case 'fiveten-yellow-500':
          return ibfYellow;
        default:
          return ibfRed;
      }
    }
    return triggerStatusLabel === TriggerStatusLabelEnum.Trigger
      ? ibfRed
      : ibfOrange;
  }

  private getFooterHtml(countryName: string): string {
    const footerHtml = this.readHtmlFile('footer.html');
    const ibfLogo = this.getLogoImageAsDataURL();
    return ejs.render(footerHtml, {
      ibfLogo: ibfLogo,
      countryName: countryName,
    });
  }

  private getCurrentDateTimeString(countryCodeISO3: string): string {
    const date = new Date();
    return this.dateObjectToDateTimeString(date, countryCodeISO3);
  }

  private dateObjectToDateTimeString(
    date: Date,
    countryCodeISO3: string,
  ): string {
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

  private getTriangleIcon(
    eapAlertClassKey: EapAlertClassKeyEnum,
    triggerStatusLabel: TriggerStatusLabelEnum,
  ) {
    const fileNameMap = {
      [EapAlertClassKeyEnum.med]: 'warning-medium.png',
      [EapAlertClassKeyEnum.min]: 'warning-low.png',
      [EapAlertClassKeyEnum.max]: 'trigger.png',
      default: 'trigger.png',
    };

    let fileName = eapAlertClassKey
      ? fileNameMap[eapAlertClassKey]
      : fileNameMap.default;
    if (
      !eapAlertClassKey &&
      triggerStatusLabel !== TriggerStatusLabelEnum.Trigger
    ) {
      fileName = 'warning-medium.png';
    }

    const filePath = `${emailIconFolder}/${fileName}`;
    return this.getPngImageAsDataURL(filePath);
  }

  private getLogoImageAsDataURL() {
    const filePath = `${emailLogoFolder}/logo-IBF.png`;
    return this.getPngImageAsDataURL(filePath);
  }

  private getPngImageAsDataURL(relativePath: string) {
    const imageBuffer = fs.readFileSync(relativePath);
    const imageDataURL = `data:image/png;base64,${imageBuffer.toString(
      'base64',
    )}`;

    return imageDataURL;
  }

  private readHtmlFile(fileName: string): string {
    return fs.readFileSync(`${emailTemplateFolder}/${fileName}`, 'utf8');
  }
}
