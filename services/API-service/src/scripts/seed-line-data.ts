import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import { LinesDataService } from '../api/lines-data/lines-data.service';
import { LinesDataEnum } from '../api/lines-data/lines-data.entity';

@Injectable()
export class SeedLineData implements InterfaceScript {
  private readonly seedHelper: SeedHelper;

  public constructor(
    private lineDataService: LinesDataService,
    connection: Connection,
  ) {
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');

    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (envCountries.includes(country.countryCodeISO3)) {
            this.seedLineData(LinesDataEnum.roads, country);
            this.seedLineData(LinesDataEnum.buildings, country);
            return;
          } else {
            return Promise.resolve();
          }
        },
      ),
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
