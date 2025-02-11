import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { countriesEnum } from '../api/country/country.enum';
import { LinesDataEnum } from '../api/lines-data/lines-data.entity';
import { LinesDataService } from '../api/lines-data/lines-data.service';
import countries from './json/countries.json';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedLineData implements InterfaceScript {
  private readonly seedHelper: SeedHelper;

  public constructor(
    private lineDataService: LinesDataService,
    dataSource: DataSource,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async run(): Promise<void> {
    await Promise.all(
      countries.map((country): Promise<void> => {
        if (countriesEnum.includes(country.countryCodeISO3)) {
          this.seedLineData(LinesDataEnum.roads, country);
          this.seedLineData(LinesDataEnum.buildings, country);
          return;
        } else {
          return Promise.resolve();
        }
      }),
    );
  }

  private async seedLineData(
    lineDataCategory: LinesDataEnum,
    country,
  ): Promise<void> {
    const filename = `./src/scripts/git-lfs/lines-layers/${lineDataCategory}_${country.countryCodeISO3}.csv`;
    try {
      const data = await this.seedHelper.getCsvData(filename);

      const validatedData = await this.lineDataService.validateArray(
        lineDataCategory,
        data,
      );
      await this.lineDataService.uploadJson(
        lineDataCategory,
        country.countryCodeISO3,
        validatedData,
      );
    } catch {
      return Promise.resolve();
    }
  }
}

export default SeedLineData;
