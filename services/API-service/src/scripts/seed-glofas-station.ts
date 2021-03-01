import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';

import { GlofasStationEntity } from '../api/glofas-station/glofas-station.entity';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedGlofasStation implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    const glofasStationRepository = this.connection.getRepository(
      GlofasStationEntity,
    );
    const adminAreaRepository = this.connection.getRepository(AdminAreaEntity);

    // ETH: GLOFAS Station per admin-area
    const stationPerAdminAreaDataETH = await this.seedHelper.getCsvData(
      './src/scripts/git-lfs/Glofas_station_per_admin_area_ETH.csv',
    );
    stationPerAdminAreaDataETH.forEach(async area => {
      const adminArea = await adminAreaRepository.findOne({
        where: { pcode: area['pcode'] },
      });
      adminArea.glofasStation = area['station_code_7day'];
      adminAreaRepository.save(adminArea);
    });

    // -- ETH: GLOFAS stations
    const glofasStationData = await this.seedHelper.getCsvData(
      './src/scripts/git-lfs/Glofas_station_locations_with_trigger_levels_IARP.csv',
    );
    const stationCodesETH = stationPerAdminAreaDataETH.map(
      area => area['station_code_7day'],
    );

    glofasStationData.forEach(async station => {
      if (stationCodesETH.includes(station['station_code'])) {
        await glofasStationRepository
          .createQueryBuilder()
          .insert()
          .values({
            countryCode: 'ETH',
            stationCode: station['station_code'],
            stationName: station['station_name'],
            triggerLevel:
              station['10yr_threshold_7day'] == ''
                ? null
                : station['10yr_threshold_7day'],
            geom: () => `st_MakePoint(${station['lon']}, ${station['lat']})`,
          })
          .execute();
      }
    });
  }
}

export default SeedGlofasStation;
