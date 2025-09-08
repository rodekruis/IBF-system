import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Event } from '../../../shared/data.model';
import { HelperService } from '../../../shared/helper.service';
import { firstCharOfWordsToUpper } from '../../../shared/utils';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../../country/country.entity';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { DisasterTypeService } from '../../disaster-type/disaster-type.service';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
import { MetadataService } from '../../metadata/metadata.service';
import { AdminAreaLabel } from '../dto/admin-area-notification-info.dto';
import { ContentEventEmail } from '../dto/content-event-email.dto';

@Injectable()
export class NotificationContentService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(
    private readonly disasterTypeService: DisasterTypeService,
    private readonly metadataService: MetadataService,
    private readonly helperService: HelperService,
  ) {}

  public async getContentActiveEvents(
    country: CountryEntity,
    disasterType: DisasterType,
    activeEvents: Event[],
  ): Promise<ContentEventEmail> {
    const contentEventEmail = new ContentEventEmail();
    contentEventEmail.disasterType =
      await this.disasterTypeService.getDisasterType(disasterType);
    contentEventEmail.events = activeEvents;
    contentEventEmail.defaultAdminLevel = this.getDefaultAdminLevel(
      country,
      disasterType,
    );

    contentEventEmail.country = country;
    contentEventEmail.mainExposureIndicatorMetadata =
      await this.metadataService.getMainExposureIndicatorMetadata(disasterType);
    contentEventEmail.eapLink = this.getEapLink(country, disasterType);
    contentEventEmail.defaultAdminAreaLabel = this.getDefaultAdminAreaLabel(
      country,
      contentEventEmail.defaultAdminLevel,
    );
    contentEventEmail.lastUploadDate =
      await this.helperService.getLastUploadDate(
        country.countryCodeISO3,
        disasterType,
      );
    return contentEventEmail;
  }

  public async getCountryNotificationInfo(
    countryCodeISO3: string,
  ): Promise<CountryEntity> {
    const findOneOptions = { countryCodeISO3 };
    const relations = [
      'disasterTypes',
      'notificationInfo',
      'countryDisasterSettings',
    ];

    return await this.countryRepository.findOne({
      where: findOneOptions,
      relations,
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

  private getEapLink(
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

  public async getEventTimeString(
    leadTime: LeadTime,
    countryCodeISO3: string,
    lastUploadDate: LastUploadDateDto,
    date?: Date,
  ): Promise<string> {
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
      PHL: { label: 'PHT', difference: 8 },
      MWI: { label: 'CAT', difference: 2 },
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
