import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { LinesDataCategory } from '../api/lines-data/lines-data.entity';
import {
  LinesDataService,
  LinesDto,
} from '../api/lines-data/lines-data.service';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

interface SeedLineDataParams {
  lineDataCategory: LinesDataCategory;
  countryCodeISO3: string;
}

@Injectable()
export class SeedLineData implements InterfaceScript<SeedLineDataParams> {
  private logger = new Logger('SeedLineData');

  private readonly seedHelper: SeedHelper;

  public constructor(
    private lineDataService: LinesDataService,
    dataSource: DataSource,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async seed({ lineDataCategory, countryCodeISO3 }) {
    const filename = `./src/scripts/git-lfs/lines-layers/${lineDataCategory}_${countryCodeISO3}.csv`;
    const linesCsv = await this.seedHelper.getCsvData<LinesDto>(filename);
    if (!linesCsv) return;

    try {
      const linesDtos = await this.lineDataService.getLinesDtos(
        lineDataCategory,
        linesCsv,
      );

      await this.lineDataService.uploadJson(
        lineDataCategory,
        countryCodeISO3,
        linesDtos,
      );
    } catch (error) {
      // If validation or upload fails, then log and throw error
      this.logger.error(`Error seeding line data: ${error}`);
      throw new HttpException(
        `Error seeding line data for ${lineDataCategory} in ${countryCodeISO3}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export default SeedLineData;
