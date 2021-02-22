import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';

import adminAreasEgypt from './git-lfs/EGY_adm1_MENAregion.json';

@Injectable()
export class SeedAdminArea implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    const adminAreaRepository = this.connection.getRepository(AdminAreaEntity);

    adminAreasEgypt.features.forEach(async area => {
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
  }
}

export default SeedAdminArea;
