import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import fs from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';

import adminAreasEGY from './git-lfs/EGY_adm1_MENAregion.json';
import adminAreasETH from './git-lfs/ETH_adm2.json';

@Injectable()
export class SeedAdminArea implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    const adminAreaRepository = this.connection.getRepository(AdminAreaEntity);

    // -- Egypt
    adminAreasEGY.features.forEach(async area => {
      await adminAreaRepository
        .createQueryBuilder()
        .insert()
        .values({
          country_code: 'EGY',
          admin_level: 1,
          name: area.properties.ADM1_EN,
          pcode: area.properties.ADM1_PCODE,
          pcode_parent: area.properties.ADM0_PCODE,
          geom: `{ "type": "MultiPolygon", "coordinates": [${area.geometry.coordinates}] }`,
        })
        .execute();
    });

    // -- Ethiopia
    adminAreasETH.features.forEach(async area => {
      await adminAreaRepository
        .createQueryBuilder()
        .insert()
        .values({
          country_code: 'ETH',
          admin_level: 2,
          name: area.properties.ZONENAME,
          pcode:
            area.properties.HRname === 'Mezhenger'
              ? area.properties.ZON_Pcode
              : area.properties.HRpcode,
          pcode_parent: area.properties.HRparent,
          geom: `{ "type": "MultiPolygon", "coordinates": [${area.geometry.coordinates}] }`,
        })
        .execute();
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

export default SeedAdminArea;
