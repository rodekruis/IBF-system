import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AlertArea, Event } from '../../../shared/data.model';
import { NumberFormat } from '../../../shared/enums/number-format.enum';
import { HelperService } from '../../../shared/helper.service';
import { firstCharOfWordsToUpper } from '../../../shared/utils';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { DisasterTypeService } from '../../disaster-type/disaster-type.service';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
import { AlertLevel } from '../../event/enum/alert-level.enum';
import { EventService } from '../../event/event.service';
import { MetadataService } from '../../metadata/metadata.service';
import { AdminAreaLabel } from '../dto/admin-area-notification-info.dto';
import { ContentEventEmail } from '../dto/content-event-email.dto';
import {
  AlertStatusLabelEnum,
  NotificationDataPerEventDto,
} from '../dto/notification-date-per-event.dto';

@Injectable()
export class NotificationContentService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(
    private readonly eventService: EventService,
    private readonly disasterTypeService: DisasterTypeService,
    private readonly metadataService: MetadataService,
    private readonly helperService: HelperService,
  ) {}

  public async getContentActiveEvents(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: Event[],
  ): Promise<ContentEventEmail> {
    const content = new ContentEventEmail();
    content.disasterType =
      await this.disasterTypeService.getDisasterType(disasterType);
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
    content.mainExposureIndicatorMetadata =
      await this.metadataService.getMainExposureIndicatorMetadata(disasterType);
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
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };
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

  public async getFormattedEventName(event: Event, disasterType: DisasterType) {
    // REFACTOR: make formattedEventName an event-property, which also the front-end can draw from
    return event.eventName
      ? `${event.eventName.split('_')[0]}`
      : (
          await this.disasterTypeService.getDisasterType(disasterType)
        ).label.toLowerCase();
  }

  private async getNotificationDataForEvents(
    activeEvents: Event[],
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<NotificationDataPerEventDto[]> {
    const sortedEvents = this.sortEventsByLeadTimeAndAlertState(activeEvents);
    const headerEventsRows = [];
    for await (const event of sortedEvents) {
      headerEventsRows.push(
        await this.getNotificationDataForEvent(event, country, disasterType),
      );
    }
    return headerEventsRows;
  }

  private async getNotificationDataForEvent(
    event: Event,
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<NotificationDataPerEventDto> {
    const data = new NotificationDataPerEventDto();
    data.event = event;
    data.triggerStatusLabel =
      event.alertLevel === AlertLevel.TRIGGER
        ? AlertStatusLabelEnum.Trigger
        : AlertStatusLabelEnum.Warning; // REFACTOR: alert level none is not handled

    data.eventName = await this.getFormattedEventName(event, disasterType);
    data.disasterSpecificProperties = event.disasterSpecificProperties;
    data.firstLeadTime = event.firstLeadTime;
    data.firstTriggerLeadTime = event.firstTriggerLeadTime;
    data.alertAreas = await this.getSortedAlertAreas(
      country,
      disasterType,
      event,
    );
    data.nrOfAlertAreas = data.alertAreas.length;

    data.issuedDate = event.firstIssuedDate;
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

    const mainExposureIndicatorMetadata =
      await this.metadataService.getMainExposureIndicatorMetadata(disasterType);
    data.totalAffectedOfIndicator = this.getTotal(
      data.alertAreas,
      mainExposureIndicatorMetadata.numberFormatMap,
    );
    data.eapAlertClass = event.disasterSpecificProperties?.eapAlertClass;
    return data;
  }

  private async getSortedAlertAreas(
    country: CountryEntity,
    disasterType: DisasterType,
    event: Event,
  ): Promise<AlertArea[]> {
    const defaultAdminLevel = this.getDefaultAdminLevel(country, disasterType);
    const alertAreas = await this.eventService.getAlertAreas(
      country.countryCodeISO3,
      disasterType,
      defaultAdminLevel,
      event.eventName,
    );

    return alertAreas.sort(this.sortByAlertLevel);
  }

  private sortByAlertLevel(
    a: { alertLevel: AlertLevel },
    b: { alertLevel: AlertLevel },
  ): number {
    // sort by alert level
    // trigger, warning, warning-medium, warning-low, none
    const alertLevelSortOrder = Object.values(AlertLevel).reverse();

    return (
      alertLevelSortOrder.indexOf(a.alertLevel) -
      alertLevelSortOrder.indexOf(b.alertLevel)
    );
  }

  private sortEventsByLeadTimeAndAlertState(events: Event[]): Event[] {
    const leadTimeValue = (leadTime: LeadTime): number =>
      Number(leadTime.split('-')[0]);

    return events.sort((a, b) => {
      if (leadTimeValue(a.firstLeadTime) < leadTimeValue(b.firstLeadTime)) {
        return -1;
      }
      if (leadTimeValue(a.firstLeadTime) > leadTimeValue(b.firstLeadTime)) {
        return 1;
      }

      return this.sortByAlertLevel(a, b);
    });
  }

  private getTotal(alertAreas: AlertArea[], numberFormat: NumberFormat) {
    const total = alertAreas.reduce(
      (acc, { mainExposureValue }) => acc + mainExposureValue,
      0,
    );

    if (numberFormat === NumberFormat.perc) {
      // return average for percentage
      return total / alertAreas.length;
    }

    // return sum
    return total;
  }

  private async getFirstLeadTimeDate(
    value: number,
    unit: string,
    lastUploadDate: LastUploadDateDto,
    date?: Date,
  ): Promise<string> {
    const now = date || lastUploadDate.timestamp;

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
    event: Event,
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
    event: Event,
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
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const startDateFirstEvent = await this.getFirstLeadTimeDate(
      Number(leadTime.split('-')[0]),
      leadTime.split('-')[1],
      lastUploadDate,
      date,
    );
    const startTimeFirstEvent = await this.getLeadTimeTimestamp(
      leadTime,
      countryCodeISO3,
      lastUploadDate,
    );
    return (
      startDateFirstEvent +
      `${startTimeFirstEvent ? ' at ' + startTimeFirstEvent : ''}`
    );
  }

  public async getDisasterTypeLabel(disasterType: DisasterType) {
    return firstCharOfWordsToUpper(
      (await this.disasterTypeService.getDisasterType(disasterType)).label,
    );
  }

  private async getLeadTimeTimestamp(
    leadTime: LeadTime,
    countryCodeISO3: string,
    lastUploadDate: LastUploadDateDto,
  ): Promise<string> {
    const timeZone = {
      PHL: {
        label: 'PHT',
        difference: 8,
      },
      MWI: {
        label: 'CAT',
        difference: 2,
      },
    };

    if (!Object.keys(timeZone).includes(countryCodeISO3)) {
      return null;
    }

    const gmtUploadDate = lastUploadDate.timestamp;
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
