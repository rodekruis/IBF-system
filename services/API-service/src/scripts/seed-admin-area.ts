import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';

import adminAreasEGY from './git-lfs/EGY_adm1_MENAregion.json';
import adminAreasETH from './git-lfs/ETH_adm2.json';
import adminAreasUGA from './git-lfs/UGA_adm2.json';
import adminAreasZMB from './git-lfs/ZMB_adm2.json';
import adminAreasKEN from './git-lfs/KEN_adm1.json';

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
          countryCode: 'EGY',
          adminLevel: 1,
          name: area.properties.ADM1_EN,
          pcode: area.properties.ADM1_PCODE,
          pcodeParent: area.properties.ADM0_PCODE,
          geom: () => this.geomFunction(area.geometry.coordinates),
        })
        .execute();
    });

    // -- Ethiopia
    adminAreasETH.features.forEach(async area => {
      await adminAreaRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCode: 'ETH',
          adminLevel: 2,
          name: area.properties.ZONENAME,
          pcode:
            area.properties.HRname === 'Mezhenger'
              ? area.properties.ZON_Pcode
              : area.properties.HRpcode,
          pcodeParent: area.properties.HRparent,
          geom: () => this.geomFunction(area.geometry.coordinates),
        })
        .execute();
    });

    // -- Uganda
    adminAreasUGA.features.forEach(async area => {
      await adminAreaRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCode: 'UGA',
          adminLevel: 2,
          name: area.properties.name,
          pcode: area.properties.pcode,
          pcodeParent: area.properties.adm1pcode,
          geom: () => this.geomFunction(area.geometry.coordinates),
        })
        .execute();
    });

    // -- Zambia
    adminAreasZMB.features.forEach(async area => {
      await adminAreaRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCode: 'ZMB',
          adminLevel: 2,
          name: area.properties.NAME,
          pcode: area.properties.pcode,
          pcodeParent: area.properties.zmb_adm__4,
          geom: () => this.geomFunction(area.geometry.coordinates),
        })
        .execute();
    });

    // -- Kenya
    adminAreasKEN.features.forEach(async area => {
      await adminAreaRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCode: 'KEN',
          adminLevel: 1,
          name: area.properties.ADM1_EN,
          pcode: area.properties.ADM1_PCODE,
          pcodeParent: null,
          geom: () => this.geomFunction(area.geometry.coordinates),
        })
        .execute();
    });
  }

  private geomFunction(coordinates) {
    return `ST_GeomFromGeoJSON( '{ "type": "MultiPolygon", "coordinates": ${JSON.stringify(
      coordinates,
    )} }' )`;
  }
}

export default SeedAdminArea;
