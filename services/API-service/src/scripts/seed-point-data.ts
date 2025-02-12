import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { countriesEnum } from '../api/country/country.enum';
import { PointDataEnum } from '../api/point-data/point-data.enum';
import { PointDataService } from '../api/point-data/point-data.service';
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

  public async run(): Promise<void> {
    await Promise.all(
      countries.map((country): Promise<void> => {
        if (countriesEnum.includes(country.countryCodeISO3)) {
          this.seedPointData(PointDataEnum.redCrossBranches, country);
          this.seedPointData(PointDataEnum.healthSites, country);
          this.seedPointData(PointDataEnum.evacuationCenters, country);
          this.seedPointData(PointDataEnum.dams, country);
          this.seedPointData(PointDataEnum.schools, country);
          this.seedPointData(PointDataEnum.waterpointsInternal, country);
          this.seedPointData(PointDataEnum.gauges, country);
          this.seedPointData(PointDataEnum.glofasStations, country);
          return;
        } else {
          return Promise.resolve();
        }
      }),
    );
  }

  private async seedPointData(
    pointDataCategory: PointDataEnum,
    country,
  ): Promise<void> {
    const filename = `./src/scripts/git-lfs/point-layers/${pointDataCategory}_${country.countryCodeISO3}.csv`;
    let data;
    try {
      data = await this.seedHelper.getCsvData(filename);
    } catch {
      return Promise.resolve();
    }

    try {
      const validatedData = await this.pointDataService.validateArray(
        pointDataCategory,
        data,
      );
      await this.pointDataService.uploadJson(
        pointDataCategory,
        country.countryCodeISO3,
        validatedData,
      );
    } catch (error) {
      throw error;
    }
  }
}

export default SeedPointData;
