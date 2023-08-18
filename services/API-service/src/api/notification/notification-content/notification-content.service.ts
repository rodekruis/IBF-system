import { AdminAreaDynamicDataService } from '../../admin-area-dynamic-data/admin-area-dynamic-data.service';
import { CountryEntity } from '../../country/country.entity';
import { Injectable } from '@nestjs/common';
import { EventService } from '../../event/event.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { DynamicIndicator } from '../../admin-area-dynamic-data/enum/dynamic-data-unit';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { DisasterEntity } from '../../disaster/disaster.entity';
import { EventSummaryCountry } from '../../../shared/data.model';
import { AdminAreaDataService } from '../../admin-area-data/admin-area-data.service';
import { AdminAreaService } from '../../admin-area/admin-area.service';
import { HelperService } from '../../../shared/helper.service';

@Injectable()
export class NotificationContentService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(DisasterEntity)
  private readonly disasterRepository: Repository<DisasterEntity>;

  public constructor(
    private readonly eventService: EventService,
    private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private readonly adminAreaDataService: AdminAreaDataService,
    private readonly adminAreaService: AdminAreaService,
    private readonly helperService: HelperService,
  ) {}

  public async getTotalAffectedPerLeadTime(
    country: CountryEntity,
    disasterType: DisasterType,
    leadTime: LeadTime,
    eventName: string,
  ) {
    const actionUnit = await this.indicatorRepository.findOne({
      where: { name: (await this.getDisaster(disasterType)).actionsUnit },
    });
    const adminLevel = country.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).defaultAdminLevel;

    let actionUnitValues =
      await this.adminAreaDynamicDataService.getAdminAreaDynamicData(
        country.countryCodeISO3,
        String(adminLevel),
        actionUnit.name as DynamicIndicator,
        disasterType,
        leadTime,
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
    actionUnitValues = actionUnitValues.filter((row) =>
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
      const weighingIndicatorValues =
        await this.adminAreaDataService.getAdminAreaData(
          country.countryCodeISO3,
          String(adminLevel),
          weighingIndicator as DynamicIndicator,
        );
      weighingIndicatorValues.forEach((row) => {
        row['weight'] = row.value;
        delete row.value;
      });

      const mergedValues = [];
      for (let i = 0; i < actionUnitValues.length; i++) {
        mergedValues.push({
          ...actionUnitValues[i],
          ...weighingIndicatorValues.find(
            (itmInner) => itmInner.placeCode === actionUnitValues[i].placeCode,
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

  public async getCountryNotificationInfo(
    countryCodeISO3,
  ): Promise<CountryEntity> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };
    const relations = [
      'disasterTypes',
      'notificationInfo',
      'countryDisasterSettings',
      'countryDisasterSettings.activeLeadTimes',
    ];

    return await this.countryRepository.findOne({
      where: findOneOptions,
      relations: relations,
    });
  }

  public async getDisaster(
    disasterType: DisasterType,
  ): Promise<DisasterEntity> {
    return await this.disasterRepository.findOne({
      where: { disasterType: disasterType },
    });
  }

  public firstCharOfWordsToUpper(input: string): string {
    return input
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  public async getLeadTimesAcrossEvents(
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

  public async getActionUnit(
    disasterType: DisasterType,
  ): Promise<IndicatorMetadataEntity> {
    return await this.indicatorRepository.findOne({
      where: { name: (await this.getDisaster(disasterType)).actionsUnit },
    });
  }

  public async getFormattedEventName(
    event: EventSummaryCountry,
    disasterType: DisasterType,
  ) {
    return event.eventName
      ? `${event.eventName.split('_')[0]}`
      : (await this.getDisaster(disasterType)).label.toLowerCase();
  }

  public formatActionUnitValue(
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

  private async getFirstLeadTimeDate(
    value: number,
    unit: string,
    countryCodeISO3: string,
    disasterType: DisasterType,
    date?: Date,
  ): Promise<string> {
    const now =
      date ||
      (await this.helperService.getRecentDate(countryCodeISO3, disasterType))
        .timestamp;

    const getNewDate = {
      month: new Date(now).setMonth(new Date(now).getMonth() + value),
      day: new Date(now).setDate(new Date(now).getDate() + value),
      hour: new Date(now).setHours(new Date(now).getHours() + value),
    };

    const dayOption: Intl.DateTimeFormatOptions =
      unit === 'month' ? {} : { day: '2-digit' };

    return new Date(getNewDate[unit]).toLocaleDateString('default', {
      ...dayOption,
      month: 'short',
      year: 'numeric',
    });
  }

  public async getLeadTimeListEvent(
    country: CountryEntity,
    event: EventSummaryCountry,
    disasterType: DisasterType,
    leadTime: LeadTime,
    date: Date,
  ) {
    const [leadTimeValue, leadTimeUnit] = leadTime.split('-');
    const eventName = await this.getFormattedEventName(event, disasterType);
    const triggerStatus = event.thresholdReached ? 'Trigger' : 'Warning';
    const dateTimePreposition = leadTimeUnit === 'month' ? 'in' : 'on';
    const dateAndTime = await this.getFirstLeadTimeDate(
      Number(leadTimeValue),
      leadTimeUnit,
      country.countryCodeISO3,
      disasterType,
      date,
    );
    const disasterSpecificCopy = await this.getDisasterSpecificCopy(
      disasterType,
      leadTime,
      event,
    );
    const leadTimeFromNow = `${leadTimeValue} ${leadTimeUnit}s`;

    const leadTimeString = disasterSpecificCopy.leadTimeString
      ? disasterSpecificCopy.leadTimeString
      : leadTimeFromNow;

    const timestamp = disasterSpecificCopy.timestamp
      ? ` at ${disasterSpecificCopy.timestamp}`
      : '';

    const triggeredAreas = await this.eventService.getTriggeredAreas(
      country.countryCodeISO3,
      disasterType,
      country.countryDisasterSettings.find(
        (d) => d.disasterType === disasterType,
      ).defaultAdminLevel,
      event.firstLeadTime,
      event.eventName,
    );
    const nrTriggeredAreas = triggeredAreas.filter(
      (a) => a.actionsValue > 0,
    ).length;

    return {
      short: `${triggerStatus} for ${eventName}: ${
        disasterSpecificCopy.extraInfo || leadTime === LeadTime.hour0
          ? leadTimeString
          : `${dateAndTime}${timestamp}`
      }<br />`,
      long: `<strong>A ${triggerStatus.toLowerCase()} for ${eventName} is issued.</strong>
      <br /><br />
      ${disasterSpecificCopy.eventStatus || 'It is forecasted: '}${
        disasterSpecificCopy.extraInfo || leadTime === LeadTime.hour0
          ? ''
          : ` ${dateTimePreposition} ${dateAndTime}${timestamp}`
      }. ${disasterSpecificCopy.extraInfo}
      <br /><br />
      There are ${nrTriggeredAreas} potentially exposed (ADMIN-AREA-PLURAL). They are listed below in order of (EXPOSURE-UNIT).
      <br /><br />
      This ${triggerStatus.toLowerCase()} was issued by IBF on ${await this.getFirstLeadTimeDate(
        0,
        leadTimeUnit,
        country.countryCodeISO3,
        disasterType,
        new Date(event.startDate),
      )}.
      <br /><br />`,
    };
  }

  public async getStartTimeEvent(
    event: EventSummaryCountry,
    countryCodeISO3: string,
    disasterType: DisasterType,
    date?: Date,
  ) {
    const startDateFirstEvent = await this.getFirstLeadTimeDate(
      Number(event.firstLeadTime.split('-')[0]),
      event.firstLeadTime.split('-')[1],
      countryCodeISO3,
      disasterType,
      date,
    );
    const startTimeFirstEvent = await this.getLeadTimeTimestamp(
      event.firstLeadTime,
      countryCodeISO3,
      disasterType,
    );
    return (
      startDateFirstEvent +
      `${startTimeFirstEvent ? ' at ' + startTimeFirstEvent : ''}`
    );
  }

  public async getDisasterTypeLabel(disasterType: DisasterType) {
    return this.firstCharOfWordsToUpper(
      (await this.getDisaster(disasterType)).label,
    );
  }

  private async getDisasterSpecificCopy(
    disasterType: DisasterType,
    leadTime: LeadTime,
    event: EventSummaryCountry,
  ): Promise<{
    eventStatus: string;
    extraInfo: string;
    leadTimeString?: string;
    timestamp?: string;
  }> {
    switch (disasterType) {
      case DisasterType.HeavyRain:
        return this.getHeavyRainCopy();
      case DisasterType.Typhoon:
        return await this.getTyphoonCopy(leadTime, event);
      case DisasterType.FlashFloods:
        return await this.getFlashFloodsCopy(leadTime, event);
      default:
        return { eventStatus: '', extraInfo: '' };
    }
  }

  private getHeavyRainCopy(): {
    eventStatus: string;
    extraInfo: string;
  } {
    return {
      eventStatus: 'Estimated',
      extraInfo: '',
    };
  }

  private async getTyphoonCopy(
    leadTime: LeadTime,
    event: EventSummaryCountry,
  ): Promise<{
    eventStatus: string;
    extraInfo: string;
    leadTimeString: string;
    timestamp: string;
  }> {
    const { typhoonLandfall, typhoonNoLandfallYet } =
      event.disasterSpecificProperties;
    let eventStatus = '';
    let extraInfo = '';
    let leadTimeString = null;

    if (leadTime === LeadTime.hour0) {
      if (typhoonLandfall) {
        eventStatus = 'Has <strong>already made landfall</strong>';
        leadTimeString = 'Already made landfall';
      } else {
        eventStatus = 'Has already reached the point closest to land';
        leadTimeString = 'reached the point closest to land';
      }
    } else {
      if (typhoonNoLandfallYet) {
        eventStatus =
          '<strong>Landfall time prediction cannot be determined yet</strong>';
        extraInfo = 'Keep monitoring the event.';
        leadTimeString = 'Undetermined landfall';
      } else if (typhoonLandfall) {
        eventStatus = 'Estimated to <strong>make landfall</strong>';
      } else {
        eventStatus =
          '<strong>Not predicted to make landfall</strong>. It is estimated to reach the point closest to land';
      }
    }

    const timestampString = await this.getLeadTimeTimestamp(
      leadTime,
      event.countryCodeISO3,
      DisasterType.Typhoon,
    );

    return {
      eventStatus: eventStatus,
      extraInfo: extraInfo,
      leadTimeString,
      timestamp: timestampString,
    };
  }

  private async getFlashFloodsCopy(
    leadTime: LeadTime,
    event: EventSummaryCountry,
  ): Promise<{
    eventStatus: string;
    extraInfo: string;
    timestamp: string;
  }> {
    const timestampString = await this.getLeadTimeTimestamp(
      leadTime,
      event.countryCodeISO3,
      DisasterType.FlashFloods,
    );
    return {
      eventStatus: 'The flash flood is forecasted: ',
      extraInfo: '',
      timestamp: timestampString,
    };
  }

  private async getLeadTimeTimestamp(
    leadTime: LeadTime,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<string> {
    const timezone = {
      PHL: {
        label: 'PHT',
        difference: 8,
      },
      MWI: {
        label: 'CAT',
        difference: 2,
      },
    };

    if (!Object.keys(timezone).includes(countryCodeISO3)) {
      return null;
    }

    const recentDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const gmtUploadDate = new Date(recentDate.timestamp);
    const hours = Number(leadTime.split('-')[0]);
    const gmtEventDate = new Date(
      gmtUploadDate.setTime(gmtUploadDate.getTime() + hours * 60 * 60 * 1000),
    );

    const hourDiff = timezone[countryCodeISO3]?.difference;
    const localEventDate = new Date(
      gmtEventDate.setTime(gmtEventDate.getTime() + hourDiff * 60 * 60 * 1000),
    );
    const timezoneLabel = timezone[countryCodeISO3]?.label;
    return `${localEventDate.getHours()}:00 ${timezoneLabel}`;
  }
}
