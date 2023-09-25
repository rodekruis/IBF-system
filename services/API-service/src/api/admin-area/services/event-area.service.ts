import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  AggregateDataRecord,
  EventSummaryCountry,
} from '../../../shared/data.model';
import { GeoJson } from '../../../shared/geo.model';
import { HelperService } from '../../../shared/helper.service';
import { AdminAreaDynamicDataEntity } from '../../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminDataReturnDto } from '../../admin-area-dynamic-data/dto/admin-data-return.dto';
import { DynamicIndicator } from '../../admin-area-dynamic-data/enum/dynamic-data-unit';
import { CountryService } from '../../country/country.service';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { DisasterEntity } from '../../disaster/disaster.entity';
import { DateDto } from '../../event/dto/date.dto';
import { EventService } from '../../event/event.service';

@Injectable()
export class EventAreaService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;

  public constructor(
    private helperService: HelperService,
    private eventService: EventService,
    private countryService: CountryService,
  ) {}

  public async getEventAreas(
    countryCodeISO3: string,
    disaster: DisasterEntity,
    lastTriggeredDate: DateDto,
  ): Promise<GeoJson> {
    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disaster.disasterType,
    );
    const country = await this.countryService.findOne(countryCodeISO3, [
      'countryDisasterSettings',
    ]);
    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };
    for await (const event of events.filter((e) => e.activeTrigger)) {
      const eventArea = country.countryDisasterSettings.find(
        (d) => d.disasterType === disaster.disasterType,
      ).eventAreas[event.eventName];
      eventArea['properties'] = {};
      eventArea['properties']['eventName'] = event.eventName;
      eventArea['properties']['placeCode'] = event.eventName;

      const aggregateValue = await this.adminAreaDynamicDataRepo
        .createQueryBuilder('dynamic')
        .select('SUM(value)', 'value') // TODO: facilitate other aggregate-cases than SUM
        .where({
          timestamp: MoreThanOrEqual(
            this.helperService.getUploadCutoffMoment(
              disaster.disasterType,
              lastTriggeredDate.timestamp,
            ),
          ),
          disasterType: disaster.disasterType,
          indicator: disaster.actionsUnit,
          eventName: event.eventName,
        })
        .getRawOne();

      eventArea['properties'][disaster.actionsUnit] = aggregateValue.value;
      geoJson.features.push(eventArea);
    }
    return geoJson;
  }

  public async getEventAreaAggregates(
    countryCodeISO3: string,
    disasterType: DisasterType,
    lastTriggeredDate: DateDto,
  ): Promise<AggregateDataRecord[]> {
    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disasterType,
    );

    const aggregateRecords = [];
    for await (const event of events.filter((e) => e.activeTrigger)) {
      const aggregateValues = await this.getEventAreaAggregatesPerIndicator(
        disasterType,
        lastTriggeredDate,
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
    lastTriggeredDate: DateDto,
  ): Promise<AdminDataReturnDto[]> {
    const events = await this.eventService.getEventSummary(
      countryCodeISO3,
      disasterType,
    );

    const records = [];
    for await (const event of events.filter((e) => e.activeTrigger)) {
      const aggregateValues = await this.getEventAreaAggregatesPerIndicator(
        disasterType,
        lastTriggeredDate,
        event,
        indicator,
      );

      const record = new AdminDataReturnDto();
      record.placeCode = event.eventName;
      record.value = aggregateValues[0].value;
      records.push(record);
    }
    return records;
  }

  private async getEventAreaAggregatesPerIndicator(
    disasterType: DisasterType,
    lastTriggeredDate: DateDto,
    event: EventSummaryCountry,
    indicator?: DynamicIndicator,
  ): Promise<{ indicator: string; value: number }[]> {
    const whereFilters = {
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
      disasterType: disasterType,
      eventName: event.eventName,
    };
    if (indicator) {
      whereFilters['indicator'] = indicator;
    }
    return await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select('dynamic."indicator"', 'indicator')
      .addSelect(
        `CASE WHEN dynamic."indicator" = 'alert_threshold' THEN MAX(value) ELSE SUM(value) END as "value"`,
      )
      .where(whereFilters)
      .groupBy('dynamic."indicator"')
      .getRawMany();
  }
}
