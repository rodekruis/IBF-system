/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { Station, GeoJson, GeoJsonFeature } from 'src/models/station.model';
import { type } from 'os';

@Injectable()
export class DataService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  public constructor(private manager: EntityManager) {}

  public async getData(schemaName: string, tableName: string): Promise<string> {
    const query = this.formQuery(schemaName, 'usp_fbf_data', 'ZMB', tableName);
    const result = await this.manager.query(query);
    return result[0].usp_fbf_data;
  }

  public async getGeodata(
    schemaName: string,
    tableName: string,
  ): Promise<string> {
    const query = this.formQuery(
      schemaName,
      'usp_fbf_geodata',
      'ZMB',
      tableName,
    );
    const result = await this.manager.query(query);
    return result[0].usp_fbf_geodata;
  }

  public async getAdminAreaData(
    countryCode: string,
    adminLevel: number,
    currentPrev: string,
    leadTime: string,
  ): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-API"."Admin_area_data' +
      adminLevel +
      '" \
    where 0 = 0 \
    and current_prev = $1 \
    and lead_time = $2 \
    ';

    const rawResult: Station[] = await this.manager.query(query, [
      currentPrev,
      leadTime,
    ]);

    const result = this.toGeojson(rawResult);

    return result;
  }

  public async getStations(
    countryCode: string,
    currentPrev: string,
    leadTime: string,
  ): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-API"."Glofas_stations" \
    where 0 = 0 \
    and current_prev = $1 \
    and lead_time = $2 \
    and country_code = $3 \
    ';

    const rawResult: Station[] = await this.manager.query(query, [
      currentPrev,
      leadTime,
      countryCode,
    ]);

    const result = this.toGeojson(rawResult);

    return result;
  }

  private toGeojson(rawResult): GeoJson {
    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };
    rawResult.forEach((i): void => {
      let feature: GeoJsonFeature = {
        type: 'Feature',
        geometry: i.geom,
        properties: {},
      };
      delete i.geom;
      feature.properties = i;
      geoJson.features.push(feature);
    });

    return geoJson;
  }

  private formQuery(schema, functionName, country, tableName): string {
    const query =
      'select "IBF-pipeline-output".' +
      functionName +
      "('" +
      country +
      "','\"" +
      schema +
      '"\',\'"' +
      tableName +
      '"\');';
    return query;
  }
}
