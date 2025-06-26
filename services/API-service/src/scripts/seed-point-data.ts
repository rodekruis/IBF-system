import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { Feature, Point, Polygon } from 'geojson';
import { DataSource } from 'typeorm';
import { GeoJSONPolygon, stringify } from 'wellknown';

import { WaterpointDto } from '../api/point-data/dto/upload-waterpoint.dto';
import { PointDataCategory } from '../api/point-data/point-data.entity';
import {
  PointDataService,
  PointDto,
} from '../api/point-data/point-data.service';
import { CI, DEV } from '../config';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

interface SeedPointDataParams {
  pointDataCategory: PointDataCategory;
  countryCodeISO3: string;
  countryBoundingBox?: Polygon;
}

interface WaterPointProperties {
  row_id: string;
  water_source: string;
  report_date: string;
}

@Injectable()
export class SeedPointData implements InterfaceScript<SeedPointDataParams> {
  private logger = new Logger('SeedPointData');

  private readonly seedHelper: SeedHelper;
  private httpService: HttpService;

  public constructor(
    private pointDataService: PointDataService,
    httpService: HttpService,
    dataSource: DataSource,
  ) {
    this.httpService = httpService;
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async seed({
    pointDataCategory,
    countryCodeISO3,
    countryBoundingBox,
  }) {
    this.logger.log(`Seed ${countryCodeISO3} ${pointDataCategory}`);

    const filePath = `./src/scripts/git-lfs/point-layers/${pointDataCategory}_${countryCodeISO3}.csv`;

    let pointCsv = await this.seedHelper.getCsvData<PointDto>(filePath);

    if (!pointCsv && !CI) {
      // if no local file, seed from external source
      // do not fetch from external source in CI or DEV environments
      // to prevent unnecessary API calls during development or testing
      if (pointDataCategory === PointDataCategory.waterpoints) {
        this.logger.log(
          `Fetch ${countryCodeISO3} from Water Point Data Exchange`,
        );

        try {
          pointCsv = (await this.fetchWaterPoints(
            countryCodeISO3,
            countryBoundingBox,
          )) as PointDto[]; // REFACTOR: this typecast should not be necessary
          this.logger.log(
            `Fetched ${pointCsv.length} water points for ${countryCodeISO3}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to fetch water points for ${countryCodeISO3}: ${error}`,
          );
        }
      }
    }

    if (!pointCsv) return;

    try {
      const pointDtos = await this.pointDataService.getPointDtos(
        pointDataCategory,
        pointCsv,
      );

      await this.pointDataService.uploadJson(
        pointDataCategory,
        countryCodeISO3,
        pointDtos,
      );
    } catch (error) {
      // If validation or upload fails, then log and throw error
      this.logger.error(`Error seeding point data: ${error}`);
      throw new HttpException(
        `Error seeding line data for ${pointDataCategory} in ${countryCodeISO3}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchWaterPoints(
    countryCodeISO3: string,
    countryBoundingBox: Polygon,
  ): Promise<WaterpointDto[]> {
    const wkt = stringify(countryBoundingBox as GeoJSONPolygon);
    const limit = DEV ? 200 : 200000;
    const path =
      `https://data.waterpointdata.org/resource/jfkt-jmqa.geojson` +
      `?$where=water_source is not null` +
      ` AND water_source !='Lake'` +
      ` AND within_polygon(geocoded_column, '${wkt}')` +
      `&$limit=${limit}` +
      `&status_id=Yes` +
      `&clean_country_id=${countryCodeISO3}`;

    return new Promise((resolve, reject) => {
      this.httpService.get(path).subscribe({
        next: (response) => {
          const rows: WaterpointDto[] = [];

          response.data.features.forEach(
            (feature: Feature<Point, WaterPointProperties>) => {
              rows.push(this.getWaterPointDto(feature));
            },
          );

          resolve(rows);
        },
        error: (error) => reject(error),
      });
    });
  }

  private getWaterPointDto(
    feature: Feature<Point, WaterPointProperties>,
  ): WaterpointDto {
    const coordinates = feature.geometry.coordinates;
    const { row_id, water_source, report_date } = feature.properties;

    return {
      fid: row_id,
      name: [water_source, row_id].join(' '),
      lat: coordinates[1],
      lon: coordinates[0],
      type: water_source,
      report_date: report_date.slice(0, 10),
    };
  }
}

export default SeedPointData;
