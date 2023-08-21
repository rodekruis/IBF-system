import { DisasterType } from './../api/disaster/disaster-type.enum';
import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { DataSource } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import { GlofasStationService } from '../api/glofas-station/glofas-station.service';

@Injectable()
export class SeedGlofasStation implements InterfaceScript {
  private readonly seedHelper: SeedHelper;

  public constructor(
    private glofasStationService: GlofasStationService,
    dataSource: DataSource,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');

    await Promise.all(
      countries.map((country): Promise<void> => {
        if (
          envCountries.includes(country.countryCodeISO3) &&
          country.disasterTypes.includes(DisasterType.Floods)
        ) {
          return this.seedCountryGlofasStations(country);
        } else {
          return Promise.resolve();
        }
      }),
    );
  }

  private async seedCountryGlofasStations(country): Promise<void> {
    const glofasStationDataFileName = `./src/scripts/git-lfs/glofas-stations/Glofas_station_locations_${country.countryCodeISO3}.csv`;
    const glofasStationData = await this.seedHelper.getCsvData(
      glofasStationDataFileName,
    );

    const validatedData = await this.glofasStationService.validateArray(
      glofasStationData,
    );

    await this.glofasStationService.uploadJson(
      country.countryCodeISO3,
      validatedData,
    );
  }
}

export default SeedGlofasStation;
