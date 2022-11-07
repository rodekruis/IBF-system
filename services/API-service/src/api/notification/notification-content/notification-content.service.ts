/* eslint-disable @typescript-eslint/camelcase */
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
  ) {}

  public async getTotalAffectedPerLeadTime(
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

  public async getCountryNotificationInfo(
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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
      name: (await this.getDisaster(disasterType)).actionsUnit,
    });
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

  public getFirstLeadTimeDate(value: number, unit: string): string {
    const now = Date.now();

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
}
