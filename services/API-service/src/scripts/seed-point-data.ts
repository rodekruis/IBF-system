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
import { CI } from '../config';
import { Country } from './interfaces/country.interface';
import countries from './json/countries.json';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

interface WaterPointProperties {
  row_id: string;
  water_source: string;
  report_date: string;
}

@Injectable()
export class SeedPointData implements InterfaceScript {
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

  public async run() {
    const envCountries = process.env.COUNTRIES.split(',');

    await Promise.all(
      (countries as Country[])
        .filter(({ countryCodeISO3 }) => envCountries.includes(countryCodeISO3))
        .flatMap(({ countryCodeISO3, countryBoundingBox }) => [
          this.seedPointData(
            PointDataCategory.redCrossBranches,
            countryCodeISO3,
          ),
          this.seedPointData(PointDataCategory.healthSites, countryCodeISO3),
          this.seedPointData(
            PointDataCategory.evacuationCenters,
            countryCodeISO3,
          ),
          this.seedPointData(PointDataCategory.dams, countryCodeISO3),
          this.seedPointData(PointDataCategory.schools, countryCodeISO3),
          this.seedPointData(
            PointDataCategory.waterpoints,
            countryCodeISO3,
            countryBoundingBox,
          ),
          this.seedPointData(PointDataCategory.gauges, countryCodeISO3),
          this.seedPointData(PointDataCategory.glofasStations, countryCodeISO3),
        ]),
    );
  }

  private async seedPointData(
    pointDataCategory: PointDataCategory,
    countryCodeISO3: string,
    countryBoundingBox?: Polygon,
  ) {
    const filePath = `./src/scripts/git-lfs/point-layers/${pointDataCategory}_${countryCodeISO3}.csv`;

    this.logger.log(`Seeding point data from ${filePath}`);

    let pointCsv = await this.seedHelper.getCsvData<PointDto>(filePath);

    if (!pointCsv) {
      if (!CI && pointDataCategory === PointDataCategory.waterpoints) {
        this.logger.log(
          `Fetching ${countryCodeISO3} from Water Point Data Exchange`,
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
            `Error fetching water points for ${countryCodeISO3}: ${error}`,
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
    const limit = 200000;
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
