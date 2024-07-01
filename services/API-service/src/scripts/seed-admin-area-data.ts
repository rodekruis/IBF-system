import { Injectable } from '@nestjs/common';

import { AdminLevel } from 'src/api/country/admin-level.enum';
import { DataSource } from 'typeorm';

import { AdminAreaDataService } from '../api/admin-area-data/admin-area-data.service';
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
      try {
        const populationData = await this.seedHelper.getCsvData(
          populationFilename,
        );

        const validatedData = await this.adminAreaDataService.validateArray(
          populationData,
        );
        await this.adminAreaDataService.prepareAndUpload(
          validatedData.filter(
            (populationRecord: AdminAreaDataRecord) =>
              populationRecord.value >= 0,
          ),
        );
      } catch (exception) {
        console.error(`Skip Indicator: Population - ${countryCodeISO3}`);
      }
    });

    if (envCountries.includes('PHL')) {
      const fileNames = [
        'vulnerable_group_PHL.csv',
        'vulnerable_housing_PHL.csv',
        'total_houses_PHL.csv',
        'vulnerability_dengue_data_ibfera_PHL.csv',
      ];
      await this.uploadFiles(fileNames);
    }

    if (envCountries.includes('UGA')) {
      const fileNames = [
        'flood_vulnerability_UGA.csv',
        'covid_risk_UGA.csv',
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
      const adminAreaData = await this.seedHelper.getCsvData(path);
      const validatedData = await this.adminAreaDataService.validateArray(
        adminAreaData,
      );
      await this.adminAreaDataService.prepareAndUpload(validatedData);
    }
  }
}

export default SeedAdminAreaData;
