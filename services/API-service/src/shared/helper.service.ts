import { Injectable } from '@nestjs/common';
import { Readable } from 'typeorm/platform/PlatformTools';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { GeoJson, GeoJsonFeature } from './geo.model';
import csv from 'csv-parser';
import { DateDto } from '../api/event/dto/date.dto';
import { Connection } from 'typeorm';
import { TriggerPerLeadTime } from '../api/event/trigger-per-lead-time.entity';
import {
  LeadTime,
  LeadTimeUnit,
} from '../api/admin-area-dynamic-data/enum/lead-time.enum';

@Injectable()
export class HelperService {
  public constructor(private connection: Connection) {}

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

  public getLast6hourInterval(
    disasterType: DisasterType,
    triggeredDate?: Date,
  ): Date {
    // This function was made to accomodate 'typhoon' setting where upload-frequency is '6 hours'
    // This means that endpoint cannot only check on date = lastTriggeredDate.date, but should also check on the right 6-hour interval
    // To be able to use this function also for other disasterTypes (freq '1 day'), it returns last 24-hour interval (midnight)
    const date = triggeredDate || new Date();
    const lastInterval = new Date(date);
    if (disasterType === DisasterType.Typhoon) {
      // The update frequency is 6 hours, so dividing up in four 6-hour intervals
      if (date.getHours() >= 18) {
        lastInterval.setHours(18, 0, 0, 0);
      } else if (date.getHours() >= 12) {
        lastInterval.setHours(12, 0, 0, 0);
      } else if (date.getHours() >= 6) {
        lastInterval.setHours(6, 0, 0, 0);
      } else {
        lastInterval.setHours(0, 0, 0, 0);
      }
    } else {
      // If other disaster-type set to 'midnight'
      lastInterval.setHours(0, 0, 0, 0);
    }
    return lastInterval;
  }

  public setDayToLastDayOfMonth(date: Date, leadTime: LeadTime): Date {
    date = new Date(date);
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
    return await new Promise(function(resolve, reject) {
      stream
        .pipe(csv())
        .on('error', error => reject(error))
        .on('data', row => parsedData.push(row))
        .on('end', () => {
          resolve(parsedData);
        });
    });
  }

  public async getRecentDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<DateDto> {
    const triggerPerLeadTimeRepository = this.connection.getRepository(
      TriggerPerLeadTime,
    );
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
