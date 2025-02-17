import { Injectable } from '@nestjs/common';

import csv from 'csv-parser';
import { DataSource } from 'typeorm';
import { Readable } from 'typeorm/platform/PlatformTools';

import {
  LeadTime,
  LeadTimeUnit,
} from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { AlertPerLeadTimeEntity } from '../api/event/alert-per-lead-time.entity';
import { LastUploadDateDto } from '../api/event/dto/last-upload-date.dto';
import { NumberFormat } from './enums/number-format.enum';
import { GeoJson, GeoJsonFeature } from './geo.model';

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
    if ([DisasterType.Malaria, DisasterType.Drought].includes(disasterType)) {
      // monthly pipeline
      lastInterval.setDate(1);
      lastInterval.setHours(0, 0, 0, 0);
    } else if ([DisasterType.Floods].includes(disasterType)) {
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

  public async getLastUploadDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<LastUploadDateDto> {
    const alertPerLeadTimeRepository = this.dataSource.getRepository(
      AlertPerLeadTimeEntity,
    );
    // REFACTOR: this data could just as well be based on adminAreaDynamicDataRepository, thereby reducing a need for this table to remain
    const result = await alertPerLeadTimeRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3, disasterType: disasterType },
      order: { timestamp: 'DESC' },
    });
    if (result) {
      return {
        date: new Date(result.date).toISOString(),
        timestamp: new Date(result.timestamp),
        cutoffMoment: this.getUploadCutoffMoment(
          disasterType,
          result.timestamp,
        ),
      };
    } else {
      return {
        date: null,
        timestamp: null,
        cutoffMoment: null,
      };
    }
  }

  /*
   * 0 becomes 0
   * 2 becomes < 10
   * 12 becomes < 20
   * 20 becomes 20
   * 56 becomes 60
   * 297 becomes 300
   * 462 becomes 460
   * 1000 becomes 1K
   * 4200 becomes 4.2K
   * 225305 becomes 230K
   * 79136946 becomes 79M
   * negative numbers become 0
   */
  toCompactNumber(
    value: number,
    format: NumberFormat = NumberFormat.decimal0,
    locale = 'en-GB',
  ) {
    if (value == null || isNaN(value)) {
      return '';
    }

    const style = format === NumberFormat.perc ? 'percent' : 'decimal';
    const maximumSignificantDigits =
      value > 100 || format === NumberFormat.perc ? 2 : 1;

    let min = 0;
    let prefix = '';

    if (format !== NumberFormat.perc) {
      if (value > 20) {
        min = 20;
      } else if (value > 0) {
        min = 10;
      }

      if (value > 0 && value < 20) {
        prefix = '< ';
      }
    }

    value = value > 0 ? Math.max(value, min) : 0;

    return `${prefix}${new Intl.NumberFormat(locale, {
      maximumSignificantDigits,
      style,
      notation: 'compact',
    }).format(value)}`;
  }
}
