import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import countries from './json/countries.json';
import fs from 'fs';
import { AdminAreaService } from '../api/admin-area/admin-area.service';

@Injectable()
export class SeedAdminArea implements InterfaceScript {
  private ADMIN_LEVELS = [1, 2, 3, 4];

  public constructor(private adminAreaService: AdminAreaService) {}

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');
    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (envCountries.includes(country.countryCodeISO3)) {
            return this.seedCountryAdminAreas(country);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedCountryAdminAreas(country): Promise<void> {
    for (const adminLevel of this.ADMIN_LEVELS) {
      const fileName = `./src/scripts/git-lfs/admin-boundaries/${country.countryCodeISO3}_adm${adminLevel}.json`;
      if (!fs.existsSync(fileName)) {
        continue;
      }
      const adminJsonRaw = fs.readFileSync(fileName, 'utf-8');
      const adminJson = JSON.parse(adminJsonRaw);

      await this.adminAreaService.addOrUpdateAdminAreas(
        country.countryCodeISO3,
        adminLevel,
        adminJson,
      );
    }
  }
}

export default SeedAdminArea;
