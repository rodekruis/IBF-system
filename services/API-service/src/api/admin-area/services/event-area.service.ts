import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { feature, featureCollection } from '@turf/helpers';
import { union } from '@turf/union';
import { Feature } from 'geojson';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { AggregateDataRecord, Event } from '../../../shared/data.model';
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
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { LastUploadDateDto } from '../../event/dto/last-upload-date.dto';
import { AlertLevel } from '../../event/enum/alert-level.enum';
import { EventService } from '../../event/event.service';
import { AdminArea } from '../dto/admin-area.dto';

@Injectable()
export class EventAreaService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;

  public constructor(private eventService: EventService) {}

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

  public getEventAdminAreas = (adminAreas: AdminArea[], indicator: string) => {
    const eventAdminAreas: Record<string, Feature<AdminArea['geom']>[]> = {};

    // reduce admin areas to events by aggregating indicator value
    const events = adminAreas.reduce((events, adminArea) => {
      const { geom, eventName, countryCodeISO3, alertLevel } = adminArea;
      const indicatorValue = adminArea[indicator];

      // try to find an existing event by eventName
      const existingEvent = events.find(
        ({ eventName: existingEventName }) => existingEventName === eventName,
      );

      if (existingEvent) {
        // add admin area to event
        eventAdminAreas[eventName].push(feature(geom));

        // aggregate indicator value
        existingEvent[indicator] =
          (existingEvent[indicator] ?? 0) + (indicatorValue ?? 0);
      } else {
        // create a new event
        eventAdminAreas[eventName] = [feature(geom)];

        events.push({
          placeCode: eventName,
          name: eventName,
          eventName,
          countryCodeISO3,
          [indicator]: indicatorValue ?? 0,
          alertLevel,
        });
      }

      return events;
    }, []);

    // create event features by merging admin areas
    const eventFeatures = events
      .map((properties) =>
        this.getEventAdminArea(
          eventAdminAreas[properties.eventName],
          properties,
        ),
      )
      .filter(Boolean); // filter out null values

    return featureCollection(eventFeatures);
  };

  private getEventAdminArea = (
    adminAreas: Feature<AdminArea['geom']>[],
    properties: Omit<AdminArea, 'geom'>,
  ) => {
    if (!adminAreas) {
      return null;
    }

    if (properties.alertLevel == AlertLevel.NONE) {
      // return null to exclude no alert events
      // getAdminAreas will fallback to admin areas if no alert event is found
      return null;
    }

    if (adminAreas.length > 1) {
      return union(featureCollection(adminAreas), { properties });
    } else if (adminAreas.length === 1) {
      return feature(adminAreas[0].geometry, properties);
    }

    return null;
  };
}
