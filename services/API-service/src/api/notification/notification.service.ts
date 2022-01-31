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
import { DisasterEntity } from '../disaster/disaster.entity';

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
  @InjectRepository(DisasterEntity)
  private readonly disasterRepository: Repository<DisasterEntity>;
  private eventService: EventService;
  private adminAreaDynamicDataService: AdminAreaDynamicDataService;

  private placeholderToday = '(TODAY)';
  private fromEmail = process.env.SUPPORT_EMAIL_ADDRESS;
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
    if (event.length && event[0].activeTrigger) {
      const country = await this.getCountryNotificationInfo(countryCodeISO3);
      const replaceKeyValues = await this.createReplaceKeyValues(
        country,
        disasterType,
        event[0].eventName,
      );
      const emailHtml = this.formatEmail(replaceKeyValues);
      const emailSubject = await this.getEmailSubject(
        country,
        disasterType,
        event[0].eventName,
      );
      this.sendEmail(emailSubject, emailHtml, countryCodeISO3);
    } else {
      console.log('No email sent, as there is no active trigger');
    }
  }

  private getSegmentId(countryCodeISO3: string): number {
    const segments = process.env.MC_SEGMENTS.split(',').map(segment =>
      segment.split(':'),
    );
    return Number(segments.find(s => s[0] === countryCodeISO3)[1]);
  }

  private async sendEmail(
    subject: string,
    emailHtml: string,
    countryCodeISO3: string,
  ): Promise<void> {
    console.log('this.fromEmail: ', this.fromEmail);
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
        segment_opts: {
          saved_segment_id: this.getSegmentId(countryCodeISO3),
        },
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
    eventName: string,
  ): Promise<string> {
    let subject = `${this.firstCharOfWordsToUpper(
      (await this.getDisaster(disasterType)).label,
    )} Warning: `;
    const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
      country.countryCodeISO3,
      disasterType,
      eventName,
    );
    const actionUnit = await this.indicatorRepository.findOne({
      name: (await this.getDisaster(disasterType)).actionsUnit,
    });
    for (const leadTime of country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        const totalActionUnit = await this.eventService.getTotalAffectedPerLeadTime(
          country.countryCodeISO3,
          disasterType,
          leadTime.leadTimeName,
        );
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
      'disasterTypes',
      'disasterTypes.leadTimes',
      'notificationInfo',
      'countryDisasterSettings',
      'countryDisasterSettings.activeLeadTimes',
    ];

    return await this.countryRepository.findOne(findOneOptions, {
      relations: relations,
    });
  }

  private async getDisaster(
    disasterType: DisasterType,
  ): Promise<DisasterEntity> {
    return await this.disasterRepository.findOne({
      where: { disasterType: disasterType },
    });
  }

  private async createReplaceKeyValues(
    country: CountryEntity,
    disasterType: DisasterType,
    eventName: string,
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
          eventName,
        ),
      },
      {
        replaceKey: this.placeholderToday,
        replaceValue: new Date().toLocaleDateString(),
      },
      {
        replaceKey: '(LEAD-DATE-LIST)',
        replaceValue: await this.getLeadTimeList(
          country,
          disasterType,
          eventName,
        ),
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
        replaceValue: country.countryDisasterSettings.find(
          s => s.disasterType === disasterType,
        ).eapLink,
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
          country.adminRegionLabels[
            String(
              country.countryDisasterSettings.find(
                s => s.disasterType === disasterType,
              ).defaultAdminLevel,
            )
          ].plural,
      },
      {
        replaceKey: '(ADMIN-AREA-SINGULAR)',
        replaceValue:
          country.adminRegionLabels[
            String(
              country.countryDisasterSettings.find(
                s => s.disasterType === disasterType,
              ).defaultAdminLevel,
            )
          ].singular,
      },
      {
        replaceKey: '(DISASTER-TYPE)',
        replaceValue: this.firstCharOfWordsToUpper(
          (await this.getDisaster(disasterType)).label,
        ),
      },
      {
        replaceKey: '(VIDEO-PDF-LINKS)',
        replaceValue: this.getVideoPdfLinks(
          country.notificationInfo.linkVideo,
          country.notificationInfo.linkPdf,
        ),
      },
    ];
    return emailKeyValueReplaceList;
  }

  private getVideoPdfLinks(videoLink: string, pdfLink: string) {
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
                    " >
                        here
                    </a>`;

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
                        "  >
                        here
                    </a>`;
    let videoStr = '';
    if (videoLink) {
      videoStr = 'Video' + linkVideoHTML;
    }
    let pdfStr = '';
    if (pdfLink) {
      pdfStr = 'PDF' + linkPdfHTML;
    }
    let andStr = '';
    if (videoStr && pdfStr) {
      andStr = 'and';
    }
    if (videoStr || pdfStr) {
      return `See instructions for the dashboard in the form of a ${videoStr} ${andStr} ${pdfStr}`;
    }
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
    eventName: string,
  ): Promise<string> {
    const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
      country.countryCodeISO3,
      disasterType,
      eventName,
    );
    let leadTimeListHTML = '';
    for (const leadTime of country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        leadTimeListHTML = `${leadTimeListHTML}<li>${
          disasterType === DisasterType.HeavyRain ? 'Estimated ' : ''
        }${leadTime.leadTimeLabel.split('-')[0]} ${
          leadTime.leadTimeLabel.split('-')[1]
        }(s) from now</li>`;
      }
    }
    return leadTimeListHTML;
  }

  private async getTriggerOverviewTables(
    country: CountryEntity,
    disasterType: DisasterType,
    eventName: string,
  ): Promise<string> {
    const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
      country.countryCodeISO3,
      disasterType,
      eventName,
    );
    let leadTimeTables = '';
    for (const leadTime of country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        const tableForLeadTime = await this.getTableForLeadTime(
          country,
          disasterType,
          leadTime,
          eventName,
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
    eventName: string,
  ): Promise<string> {
    const adminAreaLabels =
      country.adminRegionLabels[
        String(
          country.countryDisasterSettings.find(
            s => s.disasterType === disasterType,
          ).defaultAdminLevel,
        )
      ];
    const actionUnit = await this.indicatorRepository.findOne({
      name: (await this.getDisaster(disasterType)).actionsUnit,
    });
    const leadTimeValue = leadTime.leadTimeName.split('-')[0];
    const leadTimeUnit = leadTime.leadTimeName.split('-')[1];
    const tableForLeadTimeStart = `<div>
      <strong>Forecast ${
        disasterType === DisasterType.HeavyRain ? 'estimated ' : ''
      }${leadTimeValue} ${leadTimeUnit}(s) from today (${
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
      eventName,
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
    eventName: string,
  ): Promise<string> {
    const triggeredAreas = await this.eventService.getTriggeredAreas(
      country.countryCodeISO3,
      disasterType,
      country.countryDisasterSettings.find(s => s.disasterType === disasterType)
        .defaultAdminLevel,
      leadTime.leadTimeName,
      eventName,
    );
    const disaster = await this.getDisaster(disasterType);
    let areaTableString = '';
    for (const area of triggeredAreas) {
      const triggerUnitValue = await this.adminAreaDynamicDataService.getDynamicAdminAreaDataPerPcode(
        disaster.triggerUnit as DynamicIndicator,
        area.placeCode,
        leadTime.leadTimeName as LeadTime,
        eventName,
      );
      if (triggerUnitValue > 0) {
        const actionUnitValue = await this.adminAreaDynamicDataService.getDynamicAdminAreaDataPerPcode(
          disaster.actionsUnit as DynamicIndicator,
          area.placeCode,
          leadTime.leadTimeName as LeadTime,
          eventName,
        );
        const alertLevel = ''; //Leave empty for now, as it is irrelevant any way (always 'Max. alert')
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
