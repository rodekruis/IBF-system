import fs from 'fs';
import { Injectable } from '@nestjs/common';

import { AdminAreaService } from '../api/admin-area/admin-area.service';
import { EventAreaService } from '../api/admin-area/services/event-area.service';
import countries from './json/countries.json';
import { InterfaceScript } from './scripts.module';

@Injectable()
export class SeedAdminArea implements InterfaceScript {
  private ADMIN_LEVELS = [1, 2, 3, 4];

  public constructor(
    private adminAreaService: AdminAreaService,
    private eventAreaService: EventAreaService,
  ) {}

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');
    await Promise.all(
      countries.map((country): Promise<void> => {
        if (envCountries.includes(country.countryCodeISO3)) {
          return this.seedCountryAdminAreas(country);
        } else {
          return Promise.resolve();
        }
      }),
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

    // upload event-areas per disaster-type
    for (const disasterType of country.disasterTypes) {
      const fileName = `./src/scripts/git-lfs/admin-boundaries/${country.countryCodeISO3}_${disasterType}_event-areas.json`;
      if (!fs.existsSync(fileName)) {
        continue;
      }
      const adminJsonRaw = fs.readFileSync(fileName, 'utf-8');
      const adminJson = JSON.parse(adminJsonRaw);

      await this.eventAreaService.addOrUpdateEventAreas(
        country.countryCodeISO3,
        disasterType,
        adminJson,
      );
    }
  }
}

export default SeedAdminArea;
