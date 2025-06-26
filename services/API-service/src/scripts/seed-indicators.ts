import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { AdminAreaDataService } from '../api/admin-area-data/admin-area-data.service';
import { AdminAreaDataDto } from '../api/admin-area-data/dto/admin-area-data.dto';
import { StaticIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

interface SeedIndicatorsParams {
  staticIndicator: StaticIndicator;
  countryCodeISO3: string;
}

@Injectable()
export class SeedIndicators implements InterfaceScript<SeedIndicatorsParams> {
  private readonly seedHelper: SeedHelper;

  public constructor(
    private adminAreaDataService: AdminAreaDataService,
    dataSource: DataSource,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async seed({ staticIndicator, countryCodeISO3 }) {
    const fileName = `${staticIndicator.toLowerCase()}_${countryCodeISO3}.csv`;
    const path = `./src/scripts/git-lfs/admin-area-data/${fileName}`;

    const adminAreaDataCsv =
      await this.seedHelper.getCsvData<AdminAreaDataDto>(path);
    if (!adminAreaDataCsv) return;

    await this.adminAreaDataService.validate(adminAreaDataCsv);

    await this.adminAreaDataService.prepareAndUpload(adminAreaDataCsv);
  }
}

export default SeedIndicators;
