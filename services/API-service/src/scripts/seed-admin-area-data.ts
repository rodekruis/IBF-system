import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { AdminAreaDataService } from '../api/admin-area-data/admin-area-data.service';
import { AdminAreaDataDto } from '../api/admin-area-data/dto/admin-area-data.dto';
import { AdminLevel } from '../api/country/admin-level.enum';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

interface AdminAreaDataRecord {
  placeCode: string;
  adminLevel: AdminLevel;
  indicator: string;
  value: number;
}

@Injectable()
export class SeedAdminAreaData implements InterfaceScript {
  private readonly seedHelper: SeedHelper;
  private logger = new Logger('SeedAdminAreaData');

  public constructor(
    private adminAreaDataService: AdminAreaDataService,
    dataSource: DataSource,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');

    envCountries.forEach(async (countryCodeISO3: string) => {
      const populationFilename = `./src/scripts/git-lfs/admin-area-data/population_${countryCodeISO3}.csv`;

      const populationCsv =
        await this.seedHelper.getCsvData<AdminAreaDataDto>(populationFilename);
      if (!populationCsv) return;

      await this.adminAreaDataService.validate(populationCsv);

      await this.adminAreaDataService.prepareAndUpload(
        populationCsv.filter(({ value }: AdminAreaDataRecord) => value >= 0),
      );
    });

    if (envCountries.includes('PHL')) {
      const fileNames = [
        'vulnerable_group_PHL.csv',
        'vulnerable_housing_PHL.csv',
        'total_houses_PHL.csv',
      ];
      await this.uploadFiles(fileNames);
    }

    if (envCountries.includes('UGA')) {
      const fileNames = [
        'flood_vulnerability_UGA.csv',
        'drought_vulnerability_UGA.csv',
        'IPC_forecast_long_UGA.csv',
      ];
      await this.uploadFiles(fileNames);
    }

    if (envCountries.includes('KEN')) {
      const fileNames = [
        'flood_vulnerability_KEN.csv',
        'drought_vulnerability_KEN.csv',
      ];
      await this.uploadFiles(fileNames);
    }

    if (envCountries.includes('ETH')) {
      const fileNames = [
        'malaria_risk_ETH.csv',
        'malaria_suitable_temperature_ETH.csv',
        'total_idps_ETH.csv',
        'travel_time_health_motorized_ETH.csv',
        'travel_time_health_walking_ETH.csv',
        'travel_time_cities_ETH.csv',
        'population_u5_ETH.csv',
        'hotspot_general_ETH.csv',
        'hotspot_water_ETH.csv',
        'hotspot_health_ETH.csv',
        'hotspot_nutrition_ETH.csv',
        'IPC_forecast_short_ETH.csv',
        'IPC_forecast_long_ETH.csv',
      ];
      await this.uploadFiles(fileNames);
    }

    if (envCountries.includes('ZWE')) {
      const fileNames = [
        'ruminants_ZWE.csv',
        'cattle_ZWE.csv',
        'drought_vulnerability_ZWE.csv',
      ];
      await this.uploadFiles(fileNames);
    }

    if (envCountries.includes('MWI')) {
      const fileNames = ['flood_vulnerability_MWI.csv'];
      await this.uploadFiles(fileNames);
    }
  }

  private async uploadFiles(fileNames: string[]) {
    for await (const fileName of fileNames) {
      const path = `./src/scripts/git-lfs/admin-area-data/${fileName}`;

      const adminAreaDataCsv =
        await this.seedHelper.getCsvData<AdminAreaDataDto>(path);
      if (!adminAreaDataCsv) return;

      await this.adminAreaDataService.validate(adminAreaDataCsv);

      await this.adminAreaDataService.prepareAndUpload(adminAreaDataCsv);
    }
  }
}

export default SeedAdminAreaData;
