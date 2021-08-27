/* eslint-disable @typescript-eslint/camelcase */
import { AdminAreaDynamicDataService } from './../admin-area-dynamic-data/admin-area-dynamic-data.service';
import { LeadTimeEntity } from './../lead-time/lead-time.entity';
import { CountryEntity } from './../country/country.entity';
import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import fs from 'fs';
import Mailchimp from 'mailchimp-api-v3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DynamicIndicator } from '../admin-area-dynamic-data/enum/dynamic-data-unit';
import { DisasterType } from '../disaster/disaster-type.enum';

class ReplaceKeyValue {
  replaceKey: string;
  replaceValue: string;
}

@Injectable()
export class NotificationService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  private eventService: EventService;
  private adminAreaDynamicDataService: AdminAreaDynamicDataService;

  private placeholderToday = '(TODAY)';
  private fromEmail = 'support@510.global';
  private fromEmailName = 'IBF system';

  private mailchimp = new Mailchimp(process.env.MC_API);
  public constructor(
    eventService: EventService,
    adminAreaDynamicDataService: AdminAreaDynamicDataService,
  ) {
    this.eventService = eventService;
    this.adminAreaDynamicDataService = adminAreaDynamicDataService;
  }

  public async send(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const event = await this.eventService.getEventSummaryCountry(
      countryCodeISO3,
      disasterType,
    );
    if (event && event.activeTrigger) {
      const country = await this.getCountryNotificationInfo(countryCodeISO3);
      const replaceKeyValues = await this.createReplaceKeyValues(
        country,
        disasterType,
      );
      const emailHtml = this.formatEmail(replaceKeyValues);
      const emailSubject = await this.getEmailSubject(country, disasterType);
      this.sendEmail(emailSubject, emailHtml);
    } else {
      console.log('No email sent, as there is no active trigger');
    }
  }

  private async sendEmail(subject: string, emailHtml: string): Promise<void> {
    const campaignBody = {
      settings: {
        title: new Date().toISOString(),
        subject_line: subject,
        from_name: this.fromEmailName,
        reply_to: this.fromEmail,
        auto_tweet: false,
      },
      recipients: {
        list_id: process.env.MC_LIST_ID,
      },
      type: 'regular',
    };
    const createResult = await this.mailchimp.post('/campaigns', campaignBody);

    const updateBody = {
      html: emailHtml,
    };
    await this.mailchimp.put(
      `/campaigns/${createResult.id}/content`,
      updateBody,
    );
    await this.mailchimp.post(`/campaigns/${createResult.id}/actions/send`);
  }

  private async getEmailSubject(
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<string> {
    let subject = `${this.firstCharOfWordsToUpper(
      country.disasterTypes[0].label,
    )} Warning: `;
    const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
      country.countryCodeISO3,
      disasterType,
    );
    const actionUnit = await this.indicatorRepository.findOne({
      name: country.disasterTypes[0].actionsUnit,
    });
    for (const leadTime of country.countryActiveLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        const totalActionUnit = 10;
        const subjectPart = `Estimate of ${actionUnit.label}: ${String(
          totalActionUnit,
        )} (${leadTime.leadTimeName}) `;
        subject = subject + subjectPart;
      }
    }
    return subject;
  }

  private async getCountryNotificationInfo(
    countryCodeISO3,
  ): Promise<CountryEntity> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };
    const relations = [
      'countryActiveLeadTimes',
      'disasterTypes',
      'disasterTypes.leadTimes',
      'notificationInfo',
    ];

    return await this.countryRepository.findOne(findOneOptions, {
      relations: relations,
    });
  }

  private async createReplaceKeyValues(
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<ReplaceKeyValue[]> {
    const emailKeyValueReplaceList = [
      {
        replaceKey: '(SOCIAL-MEDIA-PART)',
        replaceValue: this.getSocialMediaHtml(country),
      },
      {
        replaceKey: '(TABLES-stacked)',
        replaceValue: await this.getTriggerOverviewTables(
          country,
          disasterType,
        ),
      },
      {
        replaceKey: this.placeholderToday,
        replaceValue: new Date().toLocaleDateString(),
      },
      {
        replaceKey: '(LEAD-DATE-LIST)',
        replaceValue: await this.getLeadTimeList(country, disasterType),
      },
      {
        replaceKey: '(IMG-LOGO)',
        replaceValue: country.notificationInfo.logo,
      },
      {
        replaceKey: '(TRIGGER-STATEMENT)',
        replaceValue: country.notificationInfo.triggerStatement,
      },
      {
        replaceKey: '(LINK-DASHBOARD)',
        replaceValue: process.env.DASHBOARD_URL,
      },
      {
        replaceKey: '(LINK-EAP-SOP)',
        replaceValue: country.eapLink,
      },
      {
        replaceKey: '(SOCIAL-MEDIA-LINK)',
        replaceValue: country.notificationInfo.linkSocialMediaUrl,
      },
      {
        replaceKey: '(SOCIAL-MEDIA-TYPE)',
        replaceValue: country.notificationInfo.linkSocialMediaType,
      },
      {
        replaceKey: '(ADMIN-AREA-PLURAL)',
        replaceValue:
          country.adminRegionLabels[String(country.defaultAdminLevel)].plural,
      },
      {
        replaceKey: '(ADMIN-AREA-SINGULAR)',
        replaceValue:
          country.adminRegionLabels[String(country.defaultAdminLevel)].singular,
      },
      {
        replaceKey: '(DISASTER-TYPE)',
        replaceValue: this.firstCharOfWordsToUpper(
          country.disasterTypes[0].label,
        ),
      },
    ];
    return emailKeyValueReplaceList;
  }

  private firstCharOfWordsToUpper(input: string): string {
    return input
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async getLeadTimeList(
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<string> {
    const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
      country.countryCodeISO3,
      disasterType,
    );
    let leadTimeListHTML = '';
    for (const leadTime of country.countryActiveLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        leadTimeListHTML = `${leadTimeListHTML}<li>${
          leadTime.leadTimeLabel.split('-')[0]
        } ${leadTime.leadTimeLabel.split('-')[1]}s from now</li>`;
      }
    }
    return leadTimeListHTML;
  }

  private async getTriggerOverviewTables(
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<string> {
    const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
      country.countryCodeISO3,
      disasterType,
    );
    let leadTimeTables = '';
    for (const leadTime of country.countryActiveLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        const tableForLeadTime = await this.getTableForLeadTime(
          country,
          disasterType,
          leadTime,
        );
        leadTimeTables = leadTimeTables + tableForLeadTime;
      }
    }
    return leadTimeTables;
  }

  private getSocialMediaHtml(country: CountryEntity): string {
    if (country.notificationInfo.linkSocialMediaType) {
      return fs.readFileSync(
        './src/api/notification/html/social-media-link.html',
        'utf8',
      );
    } else {
      return '';
    }
  }

  private async getTableForLeadTime(
    country: CountryEntity,
    disasterType: DisasterType,
    leadTime: LeadTimeEntity,
  ): Promise<string> {
    const adminAreaLabels =
      country.adminRegionLabels[String(country.defaultAdminLevel)];
    const actionUnit = await this.indicatorRepository.findOne({
      name: country.disasterTypes[0].actionsUnit,
    });
    const leadTimeValue = leadTime.leadTimeName.split('-')[0];
    const leadTimeUnit = leadTime.leadTimeName.split('-')[1];
    const tableForLeadTimeStart = `<div>
      <strong>Forecast ${leadTimeValue} ${leadTimeUnit}s from today (${
      this.placeholderToday
    }):</strong>
  </div>
  <table class="notification-alerts-table">
      <caption class="notification-alerts-table-caption">The following table lists all the exposed ${adminAreaLabels.plural.toLowerCase()} in order of ${actionUnit.label.toLowerCase()},</caption>
      <thead>
          <tr>
              <th align="center">Predicted ${actionUnit.label}</th>
              <th align="left">${adminAreaLabels.singular}</th>
              <th align="center">Alert Level</th>
          </tr>
      </thead>
      <tbody>
      <br>`;
    const tableForLeadTimeMiddle = await this.getAreaTables(
      country,
      disasterType,
      leadTime,
    );
    const tableForLeadTimeEnd = '</tbody></table>';
    const tableForLeadTime =
      tableForLeadTimeStart + tableForLeadTimeMiddle + tableForLeadTimeEnd;
    return tableForLeadTime;
  }

  private async getAreaTables(
    country: CountryEntity,
    disasterType: DisasterType,
    leadTime: LeadTimeEntity,
  ): Promise<string> {
    const triggeredAreas = await this.eventService.getTriggeredAreas(
      country.countryCodeISO3,
      disasterType,
      leadTime.leadTimeName,
    );
    let areaTableString = '';
    for (const area of triggeredAreas) {
      const triggerUnitValue = await this.adminAreaDynamicDataService.getDynamicAdminAreaDataPerPcode(
        country.disasterTypes[0].triggerUnit as DynamicIndicator,
        area.placeCode,
        leadTime.leadTimeName as LeadTime,
      );
      if (triggerUnitValue > 0) {
        const actionUnitValue = await this.adminAreaDynamicDataService.getDynamicAdminAreaDataPerPcode(
          country.disasterTypes[0].actionsUnit as DynamicIndicator,
          area.placeCode,
          leadTime.leadTimeName as LeadTime,
        );
        const alertLevel = ''; //this needs some extra code to get the right level for floods
        const areaTable = `<tr class='notification-alerts-table-row'>
            <td align='center'>${Math.round(actionUnitValue)}</td>
            <td align='left'>${area.name}</td>
            <td align='center'>${alertLevel}</td>
          </tr>`;
        areaTableString = areaTableString + areaTable;
      }
    }
    return areaTableString;
  }

  private formatEmail(emailKeyValueReplaceList: ReplaceKeyValue[]): string {
    let emailHtml = fs.readFileSync(
      './src/api/notification/html/trigger-notification.html',
      'utf8',
    );
    for (const entry of emailKeyValueReplaceList) {
      emailHtml = emailHtml.split(entry.replaceKey).join(entry.replaceValue);
    }
    return emailHtml;
  }
}
