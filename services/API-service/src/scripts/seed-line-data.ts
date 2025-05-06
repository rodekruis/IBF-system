import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { LinesDataCategory } from '../api/lines-data/lines-data.entity';
import {
  LinesDataService,
  LinesDto,
} from '../api/lines-data/lines-data.service';
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

  public async run() {
    const envCountries = process.env.COUNTRIES.split(',');

    await Promise.all(
      countries.map(({ countryCodeISO3 }) => {
        if (envCountries.includes(countryCodeISO3)) {
          this.seedLineData(LinesDataCategory.roads, countryCodeISO3);
          this.seedLineData(LinesDataCategory.buildings, countryCodeISO3);
          return;
        } else {
          return Promise.resolve();
        }
      }),
    );
  }

  private async seedLineData(
    lineDataCategory: LinesDataCategory,
    countryCodeISO3: string,
  ) {
    const filename = `./src/scripts/git-lfs/lines-layers/${lineDataCategory}_${countryCodeISO3}.csv`;

    try {
      const linesCsv = await this.seedHelper.getCsvData<LinesDto>(filename);

      const linesDtos = await this.lineDataService.getLinesDtos(
        lineDataCategory,
        linesCsv,
      );

      await this.lineDataService.uploadJson(
        lineDataCategory,
        countryCodeISO3,
        linesDtos,
      );
    } catch {
      return Promise.resolve();
    }
  }
}

export default SeedLineData;
