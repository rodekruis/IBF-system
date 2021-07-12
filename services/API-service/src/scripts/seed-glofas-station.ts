import { DisasterType } from './../api/disaster/disaster-type.enum';
import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';

import { GlofasStationEntity } from '../api/glofas-station/glofas-station.entity';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';

@Injectable()
export class SeedGlofasStation implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private glofasStationRepository;
  private adminAreaRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');
    this.glofasStationRepository = this.connection.getRepository(
      GlofasStationEntity,
    );
    this.adminAreaRepository = this.connection.getRepository(AdminAreaEntity);

    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (
            envCountries.includes(country.countryCodeISO3) &&
            country.disasterTypes.includes(DisasterType.Floods)
          ) {
            return this.seedCountryGlofasStations(country);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedCountryGlofasStations(country): Promise<void> {
    const stationPerAdminAreaDataFileName = `./src/scripts/git-lfs/glofas-stations/Glofas_station_per_admin_area_${country.countryCodeISO3}.csv`;
    const stationPerAdminAreaData = await this.seedHelper.getCsvData(
      stationPerAdminAreaDataFileName,
    );
    await Promise.all(
      stationPerAdminAreaData.map(
        async (area): Promise<void> => {
          const adminArea = await this.adminAreaRepository.findOne({
            where: { placeCode: area['pcode'] },
          });
          adminArea.glofasStation = area['station_code'];
          return this.adminAreaRepository.save(adminArea);
        },
      ),
    );
    const glofasStationDataFileName = `./src/scripts/git-lfs/glofas-stations/${country.glofasStationInput['fileName']}`;
    const glofasStationData = await this.seedHelper.getCsvData(
      glofasStationDataFileName,
    );
    const stationCodes = stationPerAdminAreaData.map(
      (area): string => area['station_code'],
    );

    await Promise.all(
      glofasStationData.map(
        (station): Promise<void> => {
          if (stationCodes.includes(station['station_code'])) {
            return this.glofasStationRepository
              .createQueryBuilder()
              .insert()
              .values({
                countryCodeISO3: country.countryCodeISO3,
                stationCode: station['station_code'],
                stationName: station['station_name'],
                triggerLevel:
                  station[country.glofasStationInput['triggerColName']],
                threshold2Year: station['2yr_threshold'],
                threshold5Year: station['5yr_threshold'],
                threshold10Year: station['10yr_threshold'],
                threshold20Year: station['20yr_threshold'],
                lat: station['lat'],
                lon: station['lon'],
                geom: (): string =>
                  `st_asgeojson(st_MakePoint(${station['lon']}, ${station['lat']}))::json`,
              })
              .execute();
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }
}

export default SeedGlofasStation;
