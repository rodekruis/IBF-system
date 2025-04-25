import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { InsertResult, MoreThanOrEqual, Repository } from 'typeorm';

import { AggregateDataRecord, Event } from '../../../shared/data.model';
import { GeoJson } from '../../../shared/geo.model';
import { HelperService } from '../../../shared/helper.service';
import {
  AdminAreaDynamicDataEntity,
  Indicator,
} from '../../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminDataReturnDto } from '../../admin-area-dynamic-data/dto/admin-data-return.dto';
import {
  ALERT_THRESHOLD,
  DynamicIndicator,
  FORECAST_SEVERITY,
  FORECAST_TRIGGER,
  TRIGGER,
} from '../../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { DisasterTypeEntity } from '../../disaster-type/disaster-type.entity';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
import { AlertLevel } from '../../event/enum/alert-level.enum';
import { EventService } from '../../event/event.service';
import { EventAreaEntity } from '../event-area.entity';

@Injectable()
export class EventAreaService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(EventAreaEntity)
  private readonly eventAreaRepository: Repository<EventAreaEntity>;

  public constructor(
    private helperService: HelperService,
    private eventService: EventService,
  ) {}

  public async addOrUpdateEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventAreasGeoJson: GeoJson,
  ) {
    //delete existing entries for country & adminlevel first
    await this.eventAreaRepository.delete({ countryCodeISO3 });

    // then upload new admin-areas
    await Promise.all(
      eventAreasGeoJson.features.map((area): Promise<InsertResult> => {
        return this.eventAreaRepository
          .createQueryBuilder()
          .insert()
          .values({
            countryCodeISO3,
            disasterType,
            eventAreaName: area.properties[`name`],
            geom: (): string => this.geomFunction(area.geometry.coordinates),
          })
          .execute();
      }),
    );
  }

  private geomFunction(coordinates): string {
    return `ST_GeomFromGeoJSON( '{ "type": "MultiPolygon", "coordinates": ${JSON.stringify(
      coordinates,
    )} }' )`;
  }

  public async getEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterTypeEntity,
    lastUploadDate: LastUploadDateDto,
  ): Promise<GeoJson> {
    const eventAreas = [];

    const events = await this.eventService.getEvents(
      countryCodeISO3,
      disasterType.disasterType,
    );

    for await (const event of events) {
      const eventArea = await this.eventAreaRepository
        .createQueryBuilder('area')
        .where({
          countryCodeISO3,
          disasterType: disasterType.disasterType,
          eventAreaName: event.eventName,
        })
        .select([
          'area."eventAreaName" as "name"',
          'area."countryCodeISO3" as "countryCodeISO3"',
          'ST_AsGeoJSON(area.geom)::json As geom',
        ])
        .getRawOne();

      eventArea['eventName'] = event.eventName;
      eventArea['placeCode'] = event.eventName;
      const aggregateValue = await this.adminAreaDynamicDataRepo
        .createQueryBuilder('dynamic')
        .select('SUM(value)', 'value') // TODO: facilitate other aggregate-cases than SUM
        .where({
          timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
          disasterType: disasterType.disasterType,
          indicator: disasterType.mainExposureIndicator,
          eventName: event.eventName,
        })
        .getRawOne();
      eventArea[disasterType.mainExposureIndicator] = aggregateValue.value;
      eventArea['alertLevel'] = event.alertLevel;
      eventAreas.push(eventArea);
    }

    if (eventAreas.length === 0) {
      const allEventAreas = await this.eventAreaRepository
        .createQueryBuilder('area')
        .where({ countryCodeISO3, disasterType: disasterType.disasterType })
        .select([
          'area."eventAreaName" as "name"',
          'area."countryCodeISO3" as "countryCodeISO3"',
          'ST_AsGeoJSON(area.geom)::json As geom',
        ])
        .getRawMany();
      for await (const eventArea of allEventAreas) {
        eventArea['eventName'] = eventArea.name;
        eventArea['placeCode'] = eventArea.name;
        eventArea['alertLevel'] = AlertLevel.NONE;
        eventArea[disasterType.mainExposureIndicator] = 0;

        eventAreas.push(eventArea);
      }
    }
    const geoJson = this.helperService.toGeojson(eventAreas);
    return geoJson;
  }

  public async getEventAreaAggregates(
    countryCodeISO3: string,
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
  ): Promise<AggregateDataRecord[]> {
    const events = await this.eventService.getEvents(
      countryCodeISO3,
      disasterType,
    );

    const aggregateRecords = [];
    for await (const event of events) {
      const aggregateValues = await this.getEventAreaAggregatesPerIndicator(
        disasterType,
        lastUploadDate,
        event,
      );

      for (const indicator of aggregateValues) {
        const aggregateRecord = new AggregateDataRecord();
        aggregateRecord.placeCode = event.eventName;
        aggregateRecord.indicator = indicator.indicator;
        aggregateRecord.value = indicator.value;
        aggregateRecords.push(aggregateRecord);
      }
    }
    return aggregateRecords;
  }

  public async getEventAreaDynamicData(
    event: Event,
    disasterType: DisasterType,
    indicator: DynamicIndicator,
    lastUploadDate: LastUploadDateDto,
  ): Promise<AdminDataReturnDto> {
    const aggregateValues = await this.getEventAreaAggregatesPerIndicator(
      disasterType,
      lastUploadDate,
      event,
    );

    const adminData = new AdminDataReturnDto();
    adminData.placeCode = event.eventName;
    adminData.value = this.getIndicatorValue(indicator, aggregateValues, event);
    return adminData;
  }

  private getIndicatorValue(
    indicatorName: DynamicIndicator,
    indicators: Indicator[],
    event: Event,
  ): number {
    // REFACTOR: the TRIGGER layer should not be necessary
    if (indicatorName === TRIGGER) {
      // return 'alert_threshold' if available otherwise return 1 or 0 based on alert level
      const alertThreshold = indicators.find(
        ({ indicator }) => indicator === ALERT_THRESHOLD,
      );
      if (alertThreshold) {
        return alertThreshold.value;
      } else {
        return Number(event.alertLevel === AlertLevel.TRIGGER);
      }
    }

    const indicator = indicators.find(
      ({ indicator }) => indicator === indicatorName,
    );
    return indicator.value;
  }

  private async getEventAreaAggregatesPerIndicator(
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
    event: Event,
  ): Promise<Indicator[]> {
    const whereFilters = {
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
      disasterType,
      eventName: event.eventName,
    };

    return this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select('dynamic."indicator"', 'indicator')
      .addSelect(
        `CASE WHEN dynamic."indicator" IN ('${ALERT_THRESHOLD}','${FORECAST_SEVERITY}','${FORECAST_TRIGGER}') THEN MAX(value) ELSE SUM(value) END as "value"`, // NOTE: remove 'alert_threshold' after flash-floods pipeline migrated
      )
      .where(whereFilters)
      .groupBy('dynamic."indicator"')
      .getRawMany();
  }
}
