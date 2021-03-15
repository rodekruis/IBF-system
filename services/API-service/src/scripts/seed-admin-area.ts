import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';
import countries from './json/countries.json';
import fs from 'fs';

@Injectable()
export class SeedAdminArea implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');
    const adminAreaRepository = this.connection.getRepository(AdminAreaEntity);
    await Promise.all(
      countries.map(
        async (country): Promise<void> => {
          if (envCountries.includes(country.countryCodeISO3)) {
            return this.seedCountryAdminAreas(country, adminAreaRepository);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedCountryAdminAreas(
    country,
    adminAreaRepository,
  ): Promise<void> {
    const fileName = `./src/scripts/git-lfs/${country.countryCodeISO3}_adm${country.defaultAdminLevel}.json`;
    const adminJsonRaw = fs.readFileSync(fileName, 'utf-8');
    const adminJson = JSON.parse(adminJsonRaw);
    await Promise.all(
      adminJson.features.map(
        (area): Promise<void> => {
          return adminAreaRepository
            .createQueryBuilder()
            .insert()
            .values({
              countryCode: country.countryCodeISO3,
              adminLevel: country.defaultAdminLevel,
              name: area.properties[`ADM${country.defaultAdminLevel}_EN`],
              pcode: area.properties[`ADM${country.defaultAdminLevel}_PCODE`],
              pcodeParent: area.properties[
                `ADM${country.defaultAdminLevel - 1}_PCODE`
              ]
                ? area.properties[`ADM${country.defaultAdminLevel - 1}_PCODE`]
                : null,
              geom: (): string => this.geomFunction(area.geometry.coordinates),
            })
            .execute()
            .catch(console.error);
        },
      ),
    );
  }

  private geomFunction(coordinates): string {
    return `ST_GeomFromGeoJSON( '{ "type": "MultiPolygon", "coordinates": ${JSON.stringify(
      coordinates,
    )} }' )`;
  }
}

export default SeedAdminArea;
