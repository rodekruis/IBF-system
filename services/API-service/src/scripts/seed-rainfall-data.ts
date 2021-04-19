import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import { RainfallTriggersEntity } from '../api/rainfall-triggers/rainfall-triggers.entity';
import countries from './json/countries.json';
import { HazardModel } from '../api/country/hazard-model.enum';

@Injectable()
export class SeedRainfallData implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private rainfallTriggersRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    this.rainfallTriggersRepository = this.connection.getRepository(
      RainfallTriggersEntity,
    );

    const envCountries = process.env.COUNTRIES.split(',');
    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (
            envCountries.includes(country.countryCodeISO3) &&
            country.hazardModel === HazardModel.rainfall
          ) {
            return this.seedRainfallData(country);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedRainfallData(country): Promise<void> {
    const fileName = `./src/scripts/git-lfs/rainfall/rainfall_trigger_levels_${country.countryCodeISO3}.csv`;
    const data = await this.seedHelper.getCsvData(fileName);

    await Promise.all(
      data.map(
        async (pixel): Promise<void> => {
          return this.rainfallTriggersRepository
            .createQueryBuilder()
            .insert()
            .values({
              countryCode: country.countryCodeISO3,
              lat: pixel['lat'],
              lon: pixel['lon'],
              leadTime: pixel['forecast_time'],
              triggerLevel: pixel['5yr_threshold'],
              threshold99Perc: pixel['threshold_99perc'],
              threshold2Year: pixel['2yr_threshold'],
              threshold5Year: pixel['5yr_threshold'],
              threshold10Year: pixel['10yr_threshold'],
              threshold20Year: pixel['20yr_threshold'],
              threshold50Year: pixel['50yr_threshold'],
              threshold100Year: pixel['100yr_threshold'],
            })
            .execute();
        },
      ),
    );
  }
}

export default SeedRainfallData;
