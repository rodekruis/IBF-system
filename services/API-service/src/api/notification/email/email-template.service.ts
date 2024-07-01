import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

import * as ejs from 'ejs';
import * as juice from 'juice';

import {
  EapAlertClassKeyEnum,
  EventSummaryCountry,
} from '../../../shared/data.model';
import { CountryTimeZoneMapping } from '../../country/country-time-zone-mapping';
import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../dto/notification-date-per-event.dto';
import { formatActionUnitValue } from '../helpers/format-action-unit-value.helper';

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
      emailBody: this.getEmailBody(false),
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
      disasterType: emailContent.disasterTypeLabel,
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
      emailBody: this.getEmailBody(true),
      headerEventOverview: '',
      eventOverview: this.geEventsFinishedOverview(
        country,
        events,
        disasterTypeLabel,
      ),
      imgLogo: country.notificationInfo.logo[disasterType],
      linkDashboard: process.env.DASHBOARD_URL,
      socialMediaPart: this.getSocialMediaHtml(country),
      socialMediaLink: country.notificationInfo.linkSocialMediaUrl,
      socialMediaType: country.notificationInfo.linkSocialMediaType,
      disasterType: disasterTypeLabel,
      footer: this.getFooterHtml(country.countryName),
    };
    return keyValueReplaceObject;
  }

  private getEmailBody(triggerFinished: boolean): string {
    if (triggerFinished) {
      return this.readHtmlFile('trigger-finished.html');
    } else {
      return this.readHtmlFile('trigger-notification.html');
    }
  }

  private geEventsFinishedOverview(
    country: CountryEntity,
    events: EventSummaryCountry[],
    disasterTypeLabel: string,
  ): string {
    let html = '';
    const template = this.readHtmlFile('event-finished.html');

    for (const event of events) {
      const eventFinshedHtml = ejs.render(template, {
        disasterTypeLabel: disasterTypeLabel,
        eventName: event.eventName,
        issuedDate: this.dateObjectToDateTimeString(
          new Date(event.startDate),
          country.countryCodeISO3,
        ),
        timezone: CountryTimeZoneMapping[country.countryCodeISO3],
      });
      html += eventFinshedHtml;
    }
    return html;
  }

  private getHeaderEventStarted(emailContent: ContentEventEmail): string {
    let headerEventOverview = this.readHtmlFile('header.html');
    headerEventOverview = ejs.render(headerEventOverview, {
      sentOnDate: this.getCurrentDateTimeString(
        emailContent.country.countryCodeISO3,
      ),
      disasterLabel: emailContent.disasterTypeLabel,
      nrOfEvents: emailContent.dataPerEvent.length,
      timezone: CountryTimeZoneMapping[emailContent.country.countryCodeISO3],
    });
    return headerEventOverview;
  }

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
    return html; //
  }

  private getSocialMediaHtml(country: CountryEntity): string {
    if (country.notificationInfo.linkSocialMediaType) {
      this.readHtmlFile('social-media-link.html');
    } else {
      return '';
    }
  }

  private getMapImageHtml(emailContent: ContentEventEmail): string {
    let html = '';
    for (const event of emailContent.dataPerEvent) {
      const mapImage = event.mapImage;
      if (mapImage) {
        let eventHtml = this.readHtmlFile('map-image.html');
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

  private async formatEmail(
    emailKeyValueReplaceObject: Record<string, string>,
  ): Promise<string> {
    // TODO REFACTOR: Apply styles in a septerate file also for the base.html
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
        String(emailContent.defaultAdminLevel - 1)
      ];
    return emailContent.dataPerEvent
      .map((event) => {
        const data = {
          hazard: emailContent.disasterTypeLabel,
          triggerStatusLabel: event.triggerStatusLabel,
          eventName: event.eventName,
          defaultAdminAreaLabelSingular:
            emailContent.defaultAdminAreaLabel.singular,
          defaultAdminAreaLabelPlural:
            emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),
          defaultAdminAreaLabelParent: adminAreaLabelsParent.singular,
          indicatorLabel: emailContent.indicatorMetadata.label,
          triangleIcon: this.getTriangleIcon(event.eapAlertClass?.key),
          tableRows: this.getTablesRows(event),
          color: this.ibfColorToHex(event.eapAlertClass?.color),
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
    if (eapAlertClassKey === EapAlertClassKeyEnum.med) {
      return 'Medium';
    } else if (eapAlertClassKey === EapAlertClassKeyEnum.min) {
      return 'Low';
    } else {
      return '';
    }
  }

  private getTablesRows(event: NotificationDataPerEventDto) {
    return event.triggeredAreas
      .map((area) => {
        const tableRowHmltFileName =
          TriggerStatusLabelEnum.Trigger === event.triggerStatusLabel
            ? 'table-trigger-row.html'
            : 'table-warning-row.html';
        const areaTemplate = this.readHtmlFile(tableRowHmltFileName);
        const areaData = {
          affectectedOfIndicator: area.actionsValue,
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
          hazard: emailContent.disasterTypeLabel,
          triggerStatusLabel: event.triggerStatusLabel,
          eventName: event.eventName,
          nrOfTriggeredAreas: event.nrOfTriggeredAreas,
          expectedTriggerDate: event.firstLeadTime,
          issuedDate: this.dateObjectToDateTimeString(
            event.issuedDate,
            emailContent.country.countryCodeISO3,
          ),
          startDateEventString: event.startDateDisasterString,
          defaultAdminAreaLabel:
            emailContent.defaultAdminAreaLabel.plural.toLocaleLowerCase(),
          indicatorLabel: emailContent.indicatorMetadata.label,
          totalAffectedOfIndicator: formatActionUnitValue(
            event.totalAffectedOfIndicator,
            emailContent.indicatorMetadata.numberFormatMap,
          ),
          indicatorUnit: emailContent.indicatorMetadata.unit,
          timezone:
            CountryTimeZoneMapping[emailContent.country.countryCodeISO3],
          triangleIcon: this.getTriangleIcon(event.eapAlertClass?.key),
          leadTime: event.firstLeadTime.replace('-', ' '),
          disasterIssuedLabel:
            event.eapAlertClass?.label ?? event.triggerStatusLabel,
          // REFACTOR: avoid the logic fork in disasterIssuedLabel
          // use the same label variable across all hazard types
          color: this.ibfColorToHex(event.eapAlertClass?.color),
          advisory: this.getAdvisoryHtml(
            event.triggerStatusLabel,
            emailContent.linkEapSop,
          ),
          totalAffected: this.getTotalAffectedHtml(
            event,
            emailContent.indicatorMetadata.label.toLowerCase(),
          ),
        };

        const templateFileName = 'body-event.html';
        const template = this.readHtmlFile(templateFileName);
        return ejs.render(template, data);
      })
      .join('');
  }

  private getAdvisoryHtml(
    triggerStatusLabel: TriggerStatusLabelEnum,
    eapLink: string,
  ): string {
    const advisoryHtml =
      triggerStatusLabel === TriggerStatusLabelEnum.Trigger
        ? this.readHtmlFile('advisory-trigger.html')
        : this.readHtmlFile('advisory-warning.html');

    return ejs.render(advisoryHtml, { eapLink: eapLink });
  }

  private getTotalAffectedHtml(
    event: NotificationDataPerEventDto,
    indicatorUnit: string,
  ): string {
    if (event.triggerStatusLabel === TriggerStatusLabelEnum.Warning) {
      return this.readHtmlFile('body-total-affected-warning.html');
    } else {
      const html = this.readHtmlFile('body-total-affected-trigger.html');
      return ejs.render(html, {
        totalAffectedOfIndicator: event.totalAffectedOfIndicator,
        indicatorUnit: indicatorUnit,
      });
    }
  }

  private getFooterHtml(countryName: string): string {
    const footerHtml = this.readHtmlFile('footer.html');
    const ibfLogo = this.getLogoImageAsDataURL();
    return ejs.render(footerHtml, {
      ibfLogo: ibfLogo,
      countryName: countryName,
    });
  }

  private ibfColorToHex(color: string): string {
    // TODO: Define in a place where FrontEnd and Backend can share this
    switch (color) {
      case 'ibf-orange':
        return '#aa6009';
      case 'ibf-yellow':
        return '#7d6906';
      default:
        return '#8a0f32';
    }
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

  private getTriangleIcon(eapAlertClassKey: EapAlertClassKeyEnum) {
    let fileName = '';
    if (eapAlertClassKey === EapAlertClassKeyEnum.med) {
      fileName = 'warning-medium.png';
    } else if (eapAlertClassKey === EapAlertClassKeyEnum.min) {
      fileName = 'warning-low.png';
    } else {
      fileName = 'trigger.png';
    }
    const filePath = `${emailIconFolder}/${fileName}`;
    const imageDataURL = this.getPngImageAsDataURL(filePath);
    return imageDataURL;
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
