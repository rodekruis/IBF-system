import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { InsertResult, MoreThanOrEqual, Repository } from 'typeorm';

import {
  AggregateDataRecord,
  EventSummaryCountry,
} from '../../../shared/data.model';
import { GeoJson } from '../../../shared/geo.model';
import { HelperService } from '../../../shared/helper.service';
import { AdminAreaDynamicDataEntity } from '../../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { ALERT_LEVEL_INDICATORS } from '../../admin-area-dynamic-data/const/alert-level-indicators.const';
import { AdminDataReturnDto } from '../../admin-area-dynamic-data/dto/admin-data-return.dto';
import { DynamicIndicator } from '../../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { DisasterTypeEntity } from '../../disaster-type/disaster-type.entity';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
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
    await this.eventAreaRepository.delete({
      countryCodeISO3: countryCodeISO3,
    });

    // then upload new admin-areas
    await Promise.all(
      eventAreasGeoJson.features.map((area): Promise<InsertResult> => {
        return this.eventAreaRepository
          .createQueryBuilder()
          .insert()
          .values({
            countryCodeISO3: countryCodeISO3,
            disasterType: disasterType,
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

    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disasterType.disasterType,
    );
    for await (const event of events) {
      const eventArea = await this.eventAreaRepository
        .createQueryBuilder('area')
        .where({
          countryCodeISO3: countryCodeISO3,
          disasterType: disasterType.disasterType,
          eventAreaName: event.eventName,
        })
        .select([
          'area."eventAreaName" as "eventAreaName"',
          'ST_AsGeoJSON(area.geom)::json As geom',
        ])
        .getRawOne();

      eventArea['eventName'] = event.eventName;
      eventArea['placeCode'] = event.eventName;
      const aggregateValue = await this.adminAreaDynamicDataRepo
        .createQueryBuilder('dynamic')
        .select('SUM(value)', 'value') // TODO: facilitate other aggregate-cases than SUM
        .where({
          timestamp: MoreThanOrEqual(
            this.helperService.getUploadCutoffMoment(
              disasterType.disasterType,
              lastUploadDate.timestamp,
            ),
          ),
          disasterType: disasterType.disasterType,
          indicator: disasterType.mainExposureIndicator,
          eventName: event.eventName,
        })
        .getRawOne();
      eventArea[disasterType.mainExposureIndicator] = aggregateValue.value;
      eventAreas.push(eventArea);
    }

    if (eventAreas.length === 0) {
      const allEventAreas = await this.eventAreaRepository
        .createQueryBuilder('area')
        .where({
          countryCodeISO3: countryCodeISO3,
          disasterType: disasterType.disasterType,
        })
        .select([
          'area."eventAreaName" as "eventAreaName"',
          'ST_AsGeoJSON(area.geom)::json As geom',
        ])
        .getRawMany();
      for await (const eventArea of allEventAreas) {
        eventArea['eventName'] = eventArea.eventAreaName;
        eventArea['placeCode'] = eventArea.eventAreaName;
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
    const events = await this.eventService.getEventSummary(
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
    countryCodeISO3: string,
    disasterType: DisasterType,
    indicator: DynamicIndicator,
    lastUploadDate: LastUploadDateDto,
  ): Promise<AdminDataReturnDto[]> {
    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disasterType,
    );

    const records = [];
    for await (const event of events) {
      const aggregateValues = await this.getEventAreaAggregatesPerIndicator(
        disasterType,
        lastUploadDate,
        event,
      );

      const record = new AdminDataReturnDto();
      record.placeCode = event.eventName;
      record.value =
        indicator === ALERT_LEVEL_INDICATORS.trigger
          ? this.getCalculatedFieldTriggerValue(aggregateValues)
          : aggregateValues.find((ind) => ind.indicator === indicator).value;
      records.push(record);
    }
    return records;
  }

  private getCalculatedFieldTriggerValue(
    aggregateValues: { indicator: string; value: number }[],
  ): number {
    const forecastTrigger = aggregateValues.find(
      (ind) => ind.indicator === DynamicIndicator.forecastTrigger,
    );
    // if 'forecast_trigger' available, use that ..
    if (forecastTrigger) {
      return forecastTrigger.value;
    } else {
      const forecastSeverity = aggregateValues.find(
        (ind) => ind.indicator === DynamicIndicator.forecastSeverity,
      );
      // .. if not, then check 'forecast_severity' as 'forecast_trigger' is optional. If found, then 'forecast_trigger' is assumed false ..
      if (forecastSeverity) {
        return 0;
      } else {
        const alertThreshold = aggregateValues.find(
          (ind) => ind.indicator === DynamicIndicator.alertThreshold,
        );
        // .. if also not found, then assume old style and look for alert_threshold
        if (alertThreshold) {
          return alertThreshold.value;
        }
      }
    }
  }

  private async getEventAreaAggregatesPerIndicator(
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
    event: EventSummaryCountry,
  ): Promise<{ indicator: string; value: number }[]> {
    const whereFilters = {
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
      disasterType,
      eventName: event.eventName,
    };
    return await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select('dynamic."indicator"', 'indicator')
      .addSelect(
        `CASE WHEN dynamic."indicator" IN ('${ALERT_LEVEL_INDICATORS.alertThreshold}','${ALERT_LEVEL_INDICATORS.forecastSeverity}','${ALERT_LEVEL_INDICATORS.forecastTrigger}') THEN MAX(value) ELSE SUM(value) END as "value"`, // NOTE: remove 'alert_threshold' after flash-floods pipeline migrated
      )
      .where(whereFilters)
      .groupBy('dynamic."indicator"')
      .getRawMany();
  }
}
