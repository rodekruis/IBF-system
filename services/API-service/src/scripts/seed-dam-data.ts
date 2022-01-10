import { DisasterType } from './../api/disaster/disaster-type.enum';
import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import { DamSiteEntity } from '../api/dam-site/dam-site.entity';
import countries from './json/countries.json';

@Injectable()
export class SeedDamData implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private damSiteRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    this.damSiteRepository = this.connection.getRepository(DamSiteEntity);

    const envCountries = process.env.COUNTRIES.split(',');
    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (
            envCountries.includes(country.countryCodeISO3) &&
            country.disasterTypes.includes(DisasterType.Drought)
          ) {
            return this.seedDamSiteData(country);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedDamSiteData(country): Promise<void> {
    const damSiteFileName = `./src/scripts/git-lfs/dam-sites/dam_sites_${country.countryCodeISO3}.csv`;
    const damSiteData = await this.seedHelper.getCsvData(damSiteFileName);
    const damSiteArray = damSiteData.map(dam => {
      return {
        countryCodeISO3: country.countryCodeISO3,
        damName: dam['dam_name'],
        fullSupply: dam['full_supply_capacity'],
        geom: (): string =>
          `st_asgeojson(st_MakePoint(${dam['lon']}, ${dam['lat']}))::json`,
      };
    });

    await this.damSiteRepository.save(damSiteArray);
  }
}

export default SeedDamData;
