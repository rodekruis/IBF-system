import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import fs from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { GlofasStationEntity } from '../api/glofas-station/glofas-station.entity';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';

@Injectable()
export class SeedGlofasStation implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    const glofasStationRepository = this.connection.getRepository(
      GlofasStationEntity,
    );
    const adminAreaRepository = this.connection.getRepository(AdminAreaEntity);

    // ETH: GLOFAS Station per admin-area
    const stationPerAdminAreaDataETH = await this.getCsvData(
      './src/scripts/git-lfs/Glofas_station_per_admin_area_ETH.csv',
    );
    stationPerAdminAreaDataETH.forEach(async area => {
      const adminArea = await adminAreaRepository.findOne({
        where: { pcode: area['pcode'] },
      });
      adminArea.glofas_station = area['station_code_7day'];
      adminAreaRepository.save(adminArea);
    });

    // -- ETH
    const glofasStationData = await this.getCsvData(
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
            country_code: 'ETH',
            station_code: station['station_code'],
            station_name: station['station_name'],
            trigger_level: station['10yr_threshold_7day'],
            geom: () =>
              `st_SetSrid(st_MakePoint(${station['lat']}, ${station['lon']}), 4326)`,
          })
          .execute();
      }
    });
  }

  private async getCsvData(source: string) {
    const buffer = fs.readFileSync(source);
    let data = await this.csvBufferToArray(buffer, ',');
    if (Object.keys(data[0]).length === 1) {
      data = await this.csvBufferToArray(buffer, ';');
    }
    return data;
  }

  private async csvBufferToArray(buffer, separator): Promise<object[]> {
    const stream = new Readable();
    stream.push(buffer.toString());
    stream.push(null);
    let parsedData = [];
    return await new Promise(function(resolve, reject) {
      stream
        .pipe(csv({ separator: separator }))
        .on('error', error => reject(error))
        .on('data', row => parsedData.push(row))
        .on('end', () => {
          resolve(parsedData);
        });
    });
  }
}

export default SeedGlofasStation;
