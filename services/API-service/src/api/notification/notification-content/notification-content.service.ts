import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EventSummaryCountry, TriggeredArea } from '../../../shared/data.model';
import { NumberFormat } from '../../../shared/enums/number-format.enum';
import { HelperService } from '../../../shared/helper.service';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../../country/country.entity';
import { DisasterTypeEntity } from '../../disaster-type/disaster-type.entity';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { EventService } from '../../event/event.service';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
import { AdminAreaLabel } from '../dto/admin-area-notification-info.dto';
import { ContentEventEmail } from '../dto/content-trigger-email.dto';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../dto/notification-date-per-event.dto';

@Injectable()
export class NotificationContentService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(DisasterTypeEntity)
  private readonly disasterTypeRepository: Repository<DisasterTypeEntity>;

  public constructor(
    private readonly eventService: EventService,
    private readonly helperService: HelperService,
  ) {}

  public async getContentTriggerNotification(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: EventSummaryCountry[],
  ): Promise<ContentEventEmail> {
    const content = new ContentEventEmail();
    content.disasterType = disasterType;
    content.disasterTypeLabel = await this.getDisasterTypeLabel(disasterType);
    content.dataPerEvent = await this.getNotificationDataForEvents(
      activeEvents,
      country,
      disasterType,
    );
    content.defaultAdminLevel = this.getDefaultAdminLevel(
      country,
      disasterType,
    );

    content.country = country;
    content.indicatorMetadata = await this.getIndicatorMetadata(disasterType);
    content.linkEapSop = this.getLinkEapSop(country, disasterType);
    content.defaultAdminAreaLabel = this.getDefaultAdminAreaLabel(
      country,
      content.defaultAdminLevel,
    );
    return content;
  }

  public async getCountryNotificationInfo(
    countryCodeISO3: string,
  ): Promise<CountryEntity> {
    const findOneOptions = { countryCodeISO3: countryCodeISO3 };
    const relations = [
      'disasterTypes',
      'notificationInfo',
      'countryDisasterSettings',
    ];

    return await this.countryRepository.findOne({
      where: findOneOptions,
      relations: relations,
    });
  }

  private async getDisaster(
    disasterType: DisasterType,
  ): Promise<DisasterTypeEntity> {
    return await this.disasterTypeRepository.findOne({
      where: { disasterType: disasterType },
    });
  }

  private getDefaultAdminLevel(
    country: CountryEntity,
    disasterType: DisasterType,
  ): number {
    return country.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).defaultAdminLevel;
  }

  private getLinkEapSop(
    country: CountryEntity,
    disasterType: DisasterType,
  ): string {
    return country.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).eapLink;
  }

  private getDefaultAdminAreaLabel(
    country: CountryEntity,
    adminAreaDefaultLevel: number,
  ): AdminAreaLabel {
    return country.adminRegionLabels[String(adminAreaDefaultLevel)];
  }

  private firstCharOfWordsToUpper(input: string): string {
    return input
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  public async getIndicatorMetadata(
    disasterType: DisasterType,
  ): Promise<IndicatorMetadataEntity> {
    return await this.indicatorRepository.findOne({
      where: {
        name: (await this.getDisaster(disasterType)).mainExposureIndicator,
      },
    });
  }

  public async getFormattedEventName(
    event: EventSummaryCountry,
    disasterType: DisasterType,
  ) {
    // REFACTOR: make formattedEventName a property of EventSummaryCountry, which also the front-end can draw from
    return event.eventName
      ? `${event.eventName.split('_')[0]}`
      : (await this.getDisaster(disasterType)).label.toLowerCase();
  }

  private async getNotificationDataForEvents(
    activeEvents: EventSummaryCountry[],
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<NotificationDataPerEventDto[]> {
    const sortedEvents =
      this.sortEventsByLeadTimeAndThresholdReached(activeEvents);
    const headerEventsRows = [];
    for await (const event of sortedEvents) {
      headerEventsRows.push(
        await this.getNotificationDataForEvent(event, country, disasterType),
      );
    }
    return headerEventsRows;
  }

  private async getNotificationDataForEvent(
    event: EventSummaryCountry,
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<NotificationDataPerEventDto> {
    const data = new NotificationDataPerEventDto();
    data.triggerStatusLabel = event.thresholdReached
      ? TriggerStatusLabelEnum.Trigger
      : TriggerStatusLabelEnum.Warning;

    data.eventName = await this.getFormattedEventName(event, disasterType);
    data.disasterSpecificProperties = event.disasterSpecificProperties;
    data.firstLeadTime = event.firstLeadTime;
    data.firstTriggerLeadTime = event.firstTriggerLeadTime;
    data.triggeredAreas = await this.getSortedTriggeredAreas(
      country,
      disasterType,
      event,
    );
    data.nrOfTriggeredAreas = data.triggeredAreas.length;

    data.issuedDate = new Date(event.startDate);
    data.firstLeadTimeString = await this.getFirstLeadTimeString(
      event,
      event.countryCodeISO3,
      disasterType,
    );
    data.firstTriggerLeadTimeString = await this.getFirstTriggerLeadTimeString(
      event,
      event.countryCodeISO3,
      disasterType,
    );

    const indicatorMetadata = await this.getIndicatorMetadata(disasterType);
    data.totalAffectedOfIndicator = this.getTotal(
      data.triggeredAreas,
      indicatorMetadata.numberFormatMap,
    );
    data.eapAlertClass = event.disasterSpecificProperties?.eapAlertClass;
    return data;
  }

  private async getSortedTriggeredAreas(
    country: CountryEntity,
    disasterType: DisasterType,
    event: EventSummaryCountry,
  ): Promise<TriggeredArea[]> {
    const defaultAdminLevel = this.getDefaultAdminLevel(country, disasterType);
    const triggeredAreas = await this.eventService.getTriggeredAreas(
      country.countryCodeISO3,
      disasterType,
      defaultAdminLevel,
      event.firstLeadTime,
      event.eventName,
    );
    triggeredAreas.sort((a, b) => (a.triggerValue > b.triggerValue ? -1 : 1));
    return triggeredAreas;
  }

  private sortEventsByLeadTimeAndThresholdReached(
    arr: EventSummaryCountry[],
  ): EventSummaryCountry[] {
    const leadTimeValue = (leadTime: LeadTime): number =>
      Number(leadTime.split('-')[0]);

    return arr.sort((a, b) => {
      if (leadTimeValue(a.firstLeadTime) < leadTimeValue(b.firstLeadTime)) {
        return -1;
      }
      if (leadTimeValue(a.firstLeadTime) > leadTimeValue(b.firstLeadTime)) {
        return 1;
      }

      // sort by thresholdReached (true first)
      if (a.thresholdReached === b.thresholdReached) {
        return 0;
      } else {
        return a.thresholdReached ? -1 : 1;
      }
    });
  }

  private getTotal(
    triggeredAreas: TriggeredArea[],
    numberFormat: NumberFormat,
  ) {
    const total = triggeredAreas.reduce(
      (acc, { mainExposureValue }) => acc + mainExposureValue,
      0,
    );

    if (numberFormat === NumberFormat.perc) {
      // return average for percentage
      return total / triggeredAreas.length;
    }

    // return sum
    return total;
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
      unit === 'month' ? {} : { day: '2-digit', weekday: 'long' };

    return new Date(getNewDate[unit]).toLocaleDateString('default', {
      ...dayOption,
      month: 'long',
      year: 'numeric',
    });
  }

  public async getFirstLeadTimeString(
    event: EventSummaryCountry,
    countryCodeISO3: string,
    disasterType: DisasterType,
    date?: Date,
  ): Promise<string> {
    return this.getEventTimeString(
      event.firstLeadTime,
      countryCodeISO3,
      disasterType,
      date,
    );
  }

  public async getFirstTriggerLeadTimeString(
    event: EventSummaryCountry,
    countryCodeISO3: string,
    disasterType: DisasterType,
    date?: Date,
  ): Promise<string> {
    if (event.firstTriggerLeadTime) {
      return this.getEventTimeString(
        event.firstTriggerLeadTime,
        countryCodeISO3,
        disasterType,
        date,
      );
    } else {
      return null;
    }
  }

  private async getEventTimeString(
    leadTime: LeadTime,
    countryCodeISO3: string,
    disasterType: DisasterType,
    date?: Date,
  ): Promise<string> {
    const startDateFirstEvent = await this.getFirstLeadTimeDate(
      Number(leadTime.split('-')[0]),
      leadTime.split('-')[1],
      countryCodeISO3,
      disasterType,
      date,
    );
    const startTimeFirstEvent = await this.getLeadTimeTimestamp(
      leadTime,
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

  private async getLeadTimeTimestamp(
    leadTime: LeadTime,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<string> {
    const timeZone = {
      PHL: { label: 'PHT', difference: 8 },
      MWI: { label: 'CAT', difference: 2 },
    };

    if (!Object.keys(timeZone).includes(countryCodeISO3)) {
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

    const hourDiff = timeZone[countryCodeISO3]?.difference;
    const localEventDate = new Date(
      gmtEventDate.setTime(gmtEventDate.getTime() + hourDiff * 60 * 60 * 1000),
    );
    const timezoneLabel = timeZone[countryCodeISO3]?.label;
    return `${localEventDate.getHours()}:00 ${timezoneLabel}`;
  }
}
