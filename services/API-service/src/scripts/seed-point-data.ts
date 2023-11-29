import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { DataSource } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import { PointDataEnum } from '../api/point-data/point-data.entity';
import { PointDataService } from '../api/point-data/point-data.service';

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
    const envCountries = process.env.COUNTRIES.split(',');

    await Promise.all(
      countries.map((country): Promise<void> => {
        if (envCountries.includes(country.countryCodeISO3)) {
          this.seedPointData(PointDataEnum.redCrossBranches, country);
          this.seedPointData(PointDataEnum.healthSites, country);
          this.seedPointData(PointDataEnum.evacuationCenters, country);
          this.seedPointData(PointDataEnum.dams, country);
          this.seedPointData(PointDataEnum.schools, country);
          this.seedPointData(PointDataEnum.waterpointsInternal, country);
          this.seedPointData(PointDataEnum.gauges, country);
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
    const filename = `./src/scripts/git-lfs/standard-point-layers/${pointDataCategory}_${country.countryCodeISO3}.csv`;
    try {
      const data = await this.seedHelper.getCsvData(filename);

      const validatedData = await this.pointDataService.validateArray(
        pointDataCategory,
        data,
      );
      await this.pointDataService.uploadJson(
        pointDataCategory,
        country.countryCodeISO3,
        validatedData,
      );
    } catch {
      return Promise.resolve();
    }
  }
}

export default SeedPointData;
