import { Injectable } from '@nestjs/common';
import { Readable } from 'typeorm/platform/PlatformTools';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { GeoJson, GeoJsonFeature } from './geo.model';
import csv from 'csv-parser';
import { DateDto } from '../api/event/dto/date.dto';
import { DataSource } from 'typeorm';
import { TriggerPerLeadTime } from '../api/event/trigger-per-lead-time.entity';
import {
  LeadTime,
  LeadTimeUnit,
} from '../api/admin-area-dynamic-data/enum/lead-time.enum';

@Injectable()
export class HelperService {
  public constructor(private dataSource: DataSource) {}

  public toGeojson(rawResult): GeoJson {
    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };
    rawResult.forEach((i): void => {
      const feature: GeoJsonFeature = {
        type: 'Feature',
        geometry: i.geom,
        properties: {},
      };
      delete i.geom;
      feature.properties = i;
      geoJson.features.push(feature);
    });

    return geoJson;
  }

  public getUploadCutoffMoment(disasterType: DisasterType, date: Date): Date {
    const lastInterval = new Date(date);
    if (
      [
        DisasterType.Dengue,
        DisasterType.Malaria,
        DisasterType.Drought,
      ].includes(disasterType)
    ) {
      // monthly pipeline
      lastInterval.setDate(1);
      lastInterval.setHours(0, 0, 0, 0);
    } else if (
      [DisasterType.Floods, DisasterType.HeavyRain].includes(disasterType)
    ) {
      // daily pipeline
      lastInterval.setHours(0, 0, 0, 0);
    } else if (
      [DisasterType.Typhoon, DisasterType.FlashFloods].includes(disasterType)
    ) {
      // The update frequency is 6 hours, so dividing up in four 6-hour intervals
      if (lastInterval.getHours() >= 18) {
        lastInterval.setHours(18, 0, 0, 0);
      } else if (lastInterval.getHours() >= 12) {
        lastInterval.setHours(12, 0, 0, 0);
      } else if (lastInterval.getHours() >= 6) {
        lastInterval.setHours(6, 0, 0, 0);
      } else {
        lastInterval.setHours(0, 0, 0, 0);
      }
    }
    return lastInterval;
  }

  public setDayToLastDayOfMonth(date: Date, leadTime: LeadTime): Date {
    date = date ? new Date(date) : new Date();
    if (date && leadTime.split('-')[1] === LeadTimeUnit.month) {
      if (date.getMonth() !== new Date().getMonth()) {
        // if month-of-upload is different (typically larger) than month, set day to last day of month
        date = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0);
      }
    }
    return date;
  }

  public async csvBufferToArray(buffer): Promise<object[]> {
    const stream = new Readable();
    stream.push(buffer.toString());
    stream.push(null);
    const parsedData = [];
    return await new Promise(function (resolve, reject) {
      stream
        .pipe(csv())
        .on('error', (error) => reject(error))
        .on('data', (row) => parsedData.push(row))
        .on('end', () => {
          resolve(parsedData);
        });
    });
  }

  public async getRecentDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<DateDto> {
    const triggerPerLeadTimeRepository =
      this.dataSource.getRepository(TriggerPerLeadTime);
    const result = await triggerPerLeadTimeRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3, disasterType: disasterType },
      order: { timestamp: 'DESC' },
    });
    if (result) {
      return {
        date: new Date(result.date).toISOString(),
        timestamp: new Date(result.timestamp),
      };
    } else {
      return {
        date: null,
        timestamp: null,
      };
    }
  }
}
