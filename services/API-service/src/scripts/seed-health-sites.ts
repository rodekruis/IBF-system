import { HealthSiteEntity } from './../api/health-site/health-site.entity';
import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';

@Injectable()
export class SeedHealthSites implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private healthSiteRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');
    this.healthSiteRepository = this.connection.getRepository(HealthSiteEntity);

    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (envCountries.includes(country.countryCodeISO3)) {
            return this.seedCountryHealthSites(country);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedCountryHealthSites(country): Promise<void> {
    const healthSiteFilename = `./src/scripts/git-lfs/health-sites/health_sites_${country.countryCodeISO3}.csv`;
    try {
      const healthSiteData = await this.seedHelper.getCsvData(
        healthSiteFilename,
      );

      await Promise.all(
        healthSiteData.map(
          (branch): Promise<void> => {
            return this.healthSiteRepository
              .createQueryBuilder()
              .insert()
              .values({
                countryCodeISO3: country.countryCodeISO3,
                name: branch['name'] || '-',
                type: branch['type'] || '-',
                geom: (): string =>
                  `st_MakePoint(${branch['lon']}, ${branch['lat']})`,
              })
              .execute()
              .catch(console.error);
          },
        ),
      );
    } catch {
      return Promise.resolve();
    }
  }
}

export default SeedHealthSites;
