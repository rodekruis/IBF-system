import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { PointDataCategory } from '../api/point-data/point-data.entity';
import {
  PointDataService,
  PointDto,
} from '../api/point-data/point-data.service';
import countries from './json/countries.json';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedPointData implements InterfaceScript {
  private readonly seedHelper: SeedHelper;

  public constructor(
    private pointDataService: PointDataService,
    dataSource: DataSource,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async run() {
    const envCountries = process.env.COUNTRIES.split(',');

    await Promise.all(
      countries.map(({ countryCodeISO3 }): Promise<void> => {
        if (envCountries.includes(countryCodeISO3)) {
          this.seedPointData(
            PointDataCategory.redCrossBranches,
            countryCodeISO3,
          );
          this.seedPointData(PointDataCategory.healthSites, countryCodeISO3);
          this.seedPointData(
            PointDataCategory.evacuationCenters,
            countryCodeISO3,
          );
          this.seedPointData(PointDataCategory.dams, countryCodeISO3);
          this.seedPointData(PointDataCategory.schools, countryCodeISO3);
          this.seedPointData(
            PointDataCategory.waterpointsInternal,
            countryCodeISO3,
          );
          this.seedPointData(PointDataCategory.gauges, countryCodeISO3);
          this.seedPointData(PointDataCategory.glofasStations, countryCodeISO3);
          return;
        } else {
          return Promise.resolve();
        }
      }),
    );
  }

  private async seedPointData(
    pointDataCategory: PointDataCategory,
    countryCodeISO3: string,
  ) {
    const filename = `./src/scripts/git-lfs/point-layers/${pointDataCategory}_${countryCodeISO3}.csv`;
    let pointCsv;
    try {
      pointCsv = await this.seedHelper.getCsvData<PointDto>(filename);
    } catch {
      // If file missing for some countries, this is expected, so we just return
      return Promise.resolve();
    }

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
      console.error('Error seeding point data:', error);
      throw new HttpException(
        `Error seeding line data for ${pointDataCategory} in ${countryCodeISO3}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export default SeedPointData;
