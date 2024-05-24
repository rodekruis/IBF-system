import { CountryEntity } from '../../country/country.entity';
import { Injectable } from '@nestjs/common';
import { EventService } from '../../event/event.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { DisasterEntity } from '../../disaster/disaster.entity';
import { EventSummaryCountry, TriggeredArea } from '../../../shared/data.model';
import { HelperService } from '../../../shared/helper.service';
import {
  NotificationDataPerEventDto,
  TriggerStatusLabelEnum,
} from '../dto/notification-date-per-event.dto';
import { AdminAreaLabel } from '../dto/admin-area-notification-info.dto';
import { ContentEventEmail } from '../dto/content-trigger-email.dto';

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
    content.defaultAdminAreaLabel = this.getdefaultAdminAreaLabel(
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

  private getdefaultAdminAreaLabel(
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

  private async getNotificationDataForEvents(
    activeEvents: EventSummaryCountry[],
    country: CountryEntity,
    disasterType: DisasterType,
  ): Promise<NotificationDataPerEventDto[]> {
    const sortedEvents = this.sortEventsByLeadTime(activeEvents);
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
    data.disasterSpecificCopy = await this.getDisasterSpecificCopy(
      disasterType,
      event.firstLeadTime,
      event,
    );
    data.firstLeadTime = event.firstLeadTime;
    data.firstTriggerLeadTime = event.firstTriggerLeadTime;
    data.triggeredAreas = await this.getSortedTriggeredAreas(
      country,
      disasterType,
      event,
    );
    data.nrOfTriggeredAreas = await this.getNrOfTriggeredAreas(
      data.triggeredAreas,
      data.triggerStatusLabel,
      disasterType,
    );
    // This looks weird, but as far as I understand the startDate of the event is the day it was first issued
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

    data.totalAffectedOfIndicator = this.getTotalAffectedPerEvent(
      data.triggeredAreas,
    );
    data.mapImage = await this.eventService.getEventMapImage(
      country.countryCodeISO3,
      disasterType,
      event.eventName || 'no-name',
    );
    data.eapAlertClass = event.disasterSpecificProperties.eapAlertClass;
    return data;
  }

  private async getNrOfTriggeredAreas(
    triggeredAreas: TriggeredArea[],
    statusLabel: TriggerStatusLabelEnum,
    disasterType: DisasterType,
  ): Promise<number> {
    // This filters out the areas that are affected by the event but do not have any affect action units
    // Affected action units are for example people_affected, houses_affected, etc (differs per disaster type)
    // We are not sure why this is done, but it is done in the original code
    // For warning flood events this is not done, because there are no flood extens for warning events so we do not know any actions values
    if (
      disasterType === DisasterType.Floods &&
      statusLabel === TriggerStatusLabelEnum.Warning
    ) {
      return triggeredAreas.length;
    } else {
      const triggeredAreasWithoutActionValue = triggeredAreas.filter(
        (a) => a.actionsValue > 0,
      );
      return triggeredAreasWithoutActionValue.length;
    }
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

  private sortEventsByLeadTime(
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

      return 0;
    });
  }

  private getTotalAffectedPerEvent(adminAreas: TriggeredArea[]) {
    return adminAreas.reduce((acc, cur) => acc + cur.actionsValue, 0);
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
      month: 'short',
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
