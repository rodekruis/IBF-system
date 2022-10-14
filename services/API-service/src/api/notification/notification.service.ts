/* eslint-disable @typescript-eslint/camelcase */
import { AdminAreaDynamicDataService } from './../admin-area-dynamic-data/admin-area-dynamic-data.service';
import { LeadTimeEntity } from './../lead-time/lead-time.entity';
import { CountryEntity } from './../country/country.entity';
import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import fs from 'fs';
import Mailchimp from 'mailchimp-api-v3';
import { InjectRepository } from '@nestjs/typeorm';
import { Long, Repository } from 'typeorm';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DynamicIndicator } from '../admin-area-dynamic-data/enum/dynamic-data-unit';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { EventSummaryCountry } from '../../shared/data.model';
import { AdminAreaDataService } from '../admin-area-data/admin-area-data.service';
import { AdminAreaService } from '../admin-area/admin-area.service';

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

  private placeholderToday = '(TODAY)';
  private fromEmail = process.env.SUPPORT_EMAIL_ADDRESS;
  private fromEmailName = 'IBF portal';

  private mailchimp = new Mailchimp(process.env.MC_API);

  private alreadyReached = 'Already reached (the point closest to) land';

  public constructor(
    private readonly eventService: EventService,
    private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private readonly adminAreaDataService: AdminAreaDataService,
    private readonly adminAreaService: AdminAreaService,
  ) {}

  public async send(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const events = await this.eventService.getEventSummaryCountry(
      countryCodeISO3,
      disasterType,
    );
    const activeEvents = events.filter(event => event.activeTrigger);
    if (activeEvents.length) {
      const country = await this.getCountryNotificationInfo(countryCodeISO3);
      const replaceKeyValues = await this.createReplaceKeyValues(
        country,
        disasterType,
        activeEvents,
      );
      const emailHtml = this.formatEmail(replaceKeyValues);
      const emailSubject = await this.getEmailSubject(
        country,
        disasterType,
        activeEvents,
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
    events: EventSummaryCountry[],
  ): Promise<string> {
    let subject = `${this.firstCharOfWordsToUpper(
      (await this.getDisaster(disasterType)).label,
    )} Warning: `;

    const triggeredLeadTimes = await this.getLeadTimesAcrossEvents(
      country.countryCodeISO3,
      disasterType,
      events,
    );

    const actionUnit = await this.indicatorRepository.findOne({
      name: (await this.getDisaster(disasterType)).actionsUnit,
    });
    for (const leadTime of country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        for await (const event of events) {
          // for each event ..
          const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
            country.countryCodeISO3,
            disasterType,
            event.eventName,
          );
          if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
            // .. find the right leadtime
            const totalActionUnitValue = await this.getTotalAffectedPerLeadTime(
              country,
              disasterType,
              leadTime.leadTimeName as LeadTime,
              event.eventName,
            );
            const subjectPart = `Estimate of ${
              actionUnit.label
            }: ${this.formatActionUnitValue(
              totalActionUnitValue,
              actionUnit,
            )} (${
              leadTime.leadTimeName === '0-hour'
                ? this.alreadyReached
                : leadTime.leadTimeName
            }) `;
            subject = subject + subjectPart;
          }
        }
      }
    }
    return subject;
  }

  private async getTotalAffectedPerLeadTime(
    country: CountryEntity,
    disasterType: DisasterType,
    leadTime: LeadTime,
    eventName: string,
  ) {
    const actionUnit = await this.indicatorRepository.findOne({
      name: (await this.getDisaster(disasterType)).actionsUnit,
    });
    const adminLevel = country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).defaultAdminLevel;

    let actionUnitValues = await this.adminAreaDynamicDataService.getAdminAreaDynamicData(
      country.countryCodeISO3,
      String(adminLevel),
      leadTime,
      actionUnit.name as DynamicIndicator,
      disasterType,
      eventName,
    );

    // Filter on only the areas that are also shown in dashboard, to get same aggregate metric
    const placeCodesToShow = await this.adminAreaService.getPlaceCodes(
      country.countryCodeISO3,
      disasterType,
      leadTime,
      adminLevel,
      eventName,
    );
    actionUnitValues = actionUnitValues.filter(row =>
      placeCodesToShow.includes(row.placeCode),
    );

    if (!actionUnit.weightedAvg) {
      // If no weightedAvg, then return early with simple sum
      return actionUnitValues.reduce(
        (sum, current) => sum + Number(current.value),
        0,
      );
    } else {
      const weighingIndicator = actionUnit.weightVar;
      const weighingIndicatorValues = await this.adminAreaDataService.getAdminAreaData(
        country.countryCodeISO3,
        String(adminLevel),
        weighingIndicator as DynamicIndicator,
      );
      weighingIndicatorValues.forEach(row => {
        row['weight'] = row.value;
        delete row.value;
      });

      const mergedValues = [];
      for (let i = 0; i < actionUnitValues.length; i++) {
        mergedValues.push({
          ...actionUnitValues[i],
          ...weighingIndicatorValues.find(
            itmInner => itmInner.placeCode === actionUnitValues[i].placeCode,
          ),
        });
      }

      const sumofWeighedValues = mergedValues.reduce(
        (sum, current) =>
          sum +
          (current.weight ? Number(current.weight) : 0) * Number(current.value),
        0,
      );
      const sumOfWeights = mergedValues.reduce(
        (sum, current) => sum + (current.weight ? Number(current.weight) : 0),
        0,
      );
      return sumofWeighedValues / sumOfWeights;
    }
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
    events: EventSummaryCountry[],
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
          events,
        ),
      },
      {
        replaceKey: this.placeholderToday,
        replaceValue: new Date().toLocaleDateString('default', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
      {
        replaceKey: '(LEAD-DATE-LIST-SHORT)',
        replaceValue: (
          await this.getLeadTimeList(country, disasterType, events)
        )['leadTimeListShort'],
      },
      {
        replaceKey: '(LEAD-DATE-LIST-LONG)',
        replaceValue: (
          await this.getLeadTimeList(country, disasterType, events)
        )['leadTimeListLong'],
      },
      {
        replaceKey: '(IMG-LOGO)',
        replaceValue: country.notificationInfo.logo,
      },
      {
        replaceKey: '(TRIGGER-STATEMENT)',
        replaceValue: country.notificationInfo.triggerStatement[disasterType],
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
    events: EventSummaryCountry[],
  ): Promise<object> {
    const triggeredLeadTimes = await this.getLeadTimesAcrossEvents(
      country.countryCodeISO3,
      disasterType,
      events,
    );
    let leadTimeListShort = '';
    let leadTimeListLong = '';
    for (const leadTime of country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        for await (const event of events) {
          // for each event ..
          const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
            country.countryCodeISO3,
            disasterType,
            event.eventName,
          );
          if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
            // .. find the right leadtime
            const leadTimeFromNow = `${leadTime.leadTimeLabel.split('-')[0]} ${
              leadTime.leadTimeLabel.split('-')[1]
            }s`;

            const zeroHour = leadTime.leadTimeName === '0-hour';

            const leadTimeString = zeroHour
              ? this.alreadyReached
              : leadTimeFromNow;

            const eventName = event.eventName ? `${event.eventName}` : '';

            const triggerStatus = event.thresholdReached
              ? '<strong>trigger reached</strong>'
              : 'trigger not reached';

            const dateAndTime = this.getFirstLeadTimeDate(
              leadTime.leadTimeName,
            );

            const prefixes = {
              [DisasterType.HeavyRain]: 'Estimated',
              [DisasterType.Typhoon]: 'Forecasted to reach',
              default: '',
            };

            const longListAdditions = {
              [DisasterType.Typhoon]: '(point closest to) land',
              default: '',
            };

            const prefix = prefixes[disasterType] || prefixes.default;

            const longListAddition =
              longListAdditions[disasterType] || prefixes.default;

            leadTimeListShort = `${leadTimeListShort}<li>${eventName}: ${dateAndTime} (${leadTimeString})</li>`;

            leadTimeListLong = `${leadTimeListLong}<li>${eventName} - ${triggerStatus}: ${prefix} ${longListAddition} on ${dateAndTime} (${leadTimeString})</li>`;
          }
        }
      }
    }
    return { leadTimeListShort, leadTimeListLong };
  }

  private async getLeadTimesAcrossEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    events: EventSummaryCountry[],
  ) {
    let triggeredLeadTimes;
    for await (const event of events) {
      const newLeadTimes = await this.eventService.getTriggerPerLeadtime(
        countryCodeISO3,
        disasterType,
        event.eventName,
      );
      triggeredLeadTimes = { ...triggeredLeadTimes, ...newLeadTimes };
    }
    return triggeredLeadTimes;
  }

  private async getTriggerOverviewTables(
    country: CountryEntity,
    disasterType: DisasterType,
    events: EventSummaryCountry[],
  ): Promise<string> {
    const triggeredLeadTimes = await this.getLeadTimesAcrossEvents(
      country.countryCodeISO3,
      disasterType,
      events,
    );
    let leadTimeTables = '';
    for (const leadTime of country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      if (triggeredLeadTimes[leadTime.leadTimeName] === '1') {
        for await (const event of events) {
          // for each event ..
          const triggeredLeadTimes = await this.eventService.getTriggerPerLeadtime(
            country.countryCodeISO3,
            disasterType,
            event.eventName,
          );
          if (
            triggeredLeadTimes[leadTime.leadTimeName] === '1' &&
            event.thresholdReached // Only show table if trigger reached
          ) {
            // .. find the right leadtime
            const tableForLeadTime = await this.getTableForLeadTime(
              country,
              disasterType,
              leadTime,
              event.eventName,
            );
            leadTimeTables = leadTimeTables + tableForLeadTime;
          }
        }
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
    const adminLevel = country.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).defaultAdminLevel;
    const adminAreaLabels = country.adminRegionLabels[String(adminLevel)];
    const adminAreaLabelsParent =
      country.adminRegionLabels[String(adminLevel - 1)];

    const actionUnit = await this.indicatorRepository.findOne({
      name: (await this.getDisaster(disasterType)).actionsUnit,
    });
    const leadTimeValue = leadTime.leadTimeName.split('-')[0];
    const leadTimeUnit = leadTime.leadTimeName.split('-')[1];

    const zeroHour = leadTime.leadTimeName === '0-hour';

    const tableForLeadTimeStart = `<div>
      <strong>${
        zeroHour
          ? this.alreadyReached
          : `Forecast ${
              disasterType === DisasterType.HeavyRain ? 'estimated ' : ''
            }${leadTimeValue} ${leadTimeUnit}(s) from`
      } today (${this.placeholderToday}):</strong>
  </div>
  <table class="notification-alerts-table">
      <caption class="notification-alerts-table-caption">The following table lists all the exposed ${adminAreaLabels.plural.toLowerCase()} in order of ${actionUnit.label.toLowerCase()},</caption>
      <thead>
          <tr>
              <th align="center">Predicted ${actionUnit.label}</th>
              <th align="left">${adminAreaLabels.singular}${
      adminAreaLabelsParent ? ' (' + adminAreaLabelsParent.singular + ')' : ''
    }</th>
          </tr>
      </thead>
      <tbody>
      <br>`;
    const tableForLeadTimeMiddle = await this.getAreaTables(
      country,
      disasterType,
      leadTime,
      eventName,
      actionUnit,
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
    actionUnit: IndicatorMetadataEntity,
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
      const actionUnitValue = await this.adminAreaDynamicDataService.getDynamicAdminAreaDataPerPcode(
        disaster.actionsUnit as DynamicIndicator,
        area.placeCode,
        leadTime.leadTimeName as LeadTime,
        eventName,
      );
      const areaTable = `<tr class='notification-alerts-table-row'>
            <td align='center'>${this.formatActionUnitValue(
              actionUnitValue,
              actionUnit,
            )}</td>
            <td align='left'>${area.name}${
        area.nameParent ? ' (' + area.nameParent + ')' : ''
      }</td>
          </tr>`;
      areaTableString = areaTableString + areaTable;
    }
    return areaTableString;
  }

  private formatActionUnitValue(
    value: number,
    actionUnit: IndicatorMetadataEntity,
  ) {
    if (value === null) {
      return null;
    } else if (actionUnit.numberFormatMap === 'perc') {
      return Math.round(value * 100).toLocaleString() + '%';
    } else if (actionUnit.numberFormatMap === 'decimal2') {
      return (Math.round(value * 100) / 100).toLocaleString();
    } else if (actionUnit.numberFormatMap === 'decimal0') {
      return Math.round(value).toLocaleString();
    } else {
      return Math.round(value).toLocaleString();
    }
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

  private getFirstLeadTimeDate(leadTime: string): string {
    const now = Date.now();

    const [valueString, unit] = leadTime.split('-');
    const value = Number(valueString);

    const getNewDate = {
      month: new Date(now).setMonth(new Date(now).getMonth() + value),
      day: new Date(now).setDate(new Date(now).getDate() + value),
      hour: new Date(now).setHours(new Date(now).getHours() + value),
    };

    return new Date(getNewDate[unit]).toLocaleDateString('default', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
