import { Injectable } from '@nestjs/common';

import fs from 'fs';

import { AdminAreaService } from '../api/admin-area/admin-area.service';
import { Country } from './interfaces/country.interface';
import countries from './json/countries.json';
import { InterfaceScript } from './scripts.module';

@Injectable()
export class SeedAdminArea implements InterfaceScript {
  private ADMIN_LEVELS = [1, 2, 3, 4];

  public constructor(private adminAreaService: AdminAreaService) {}

  public async seed() {
    const envCountries = process.env.COUNTRIES.split(',');
    await Promise.all(
      (countries as Country[]).map((country) => {
        if (envCountries.includes(country.countryCodeISO3)) {
          return this.seedCountryAdminAreas(country);
        } else {
          return Promise.resolve();
        }
      }),
    );
  }

  private async seedCountryAdminAreas(country: Country) {
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
        true,
      );
    }
  }
}

export default SeedAdminArea;
