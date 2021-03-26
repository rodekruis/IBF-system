import { EventSummaryCountry } from './data.model';
/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { AdminAreaDataRecord, TriggeredArea } from './data.model';
import {
  GeoJson,
  GeoJsonFeature,
  GlofasStation,
  RedCrossBranch,
} from './geo.model';
import fs from 'fs';

@Injectable()
export class DataService {
  @InjectRepository(UserEntity)
  private manager: EntityManager;

  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

  public async getAdminAreaData(
    countryCodeISO3: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<GeoJson> {
    const trigger = (await this.getTriggerPerLeadtime(countryCodeISO3))[
      leadTime.substr(0, 1)
    ];
    let placeCodes;
    if (parseInt(trigger) === 1) {
      placeCodes = (await this.getTriggeredAreas(countryCodeISO3)).map(
        (triggeredArea): string => "'" + triggeredArea.placeCode + "'",
      );
    }

    const query =
      `select *
    from "IBF-API"."Admin_area_data` +
      adminLevel +
      `"
    where 0 = 0
    and lead_time = $1
    and country_code = $2`.concat(
        placeCodes && placeCodes.length > 0
          ? ' and pcode in (' + placeCodes.toString() + ')'
          : '',
      );
    const rawResult: AdminAreaDataRecord[] = await this.manager.query(query, [
      leadTime,
      countryCodeISO3,
    ]);
    const result = this.toGeojson(rawResult);
    return result;
  }

  public async getStations(
    countryCode: string,
    leadTime: string,
  ): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-API"."Glofas_stations" \
    where 0 = 0 \
    and lead_time = $1 \
    and country_code = $2 \
    ';

    const rawResult: GlofasStation[] = await this.manager.query(query, [
      leadTime,
      countryCode,
    ]);

    const result = this.toGeojson(rawResult);

    return result;
  }

  public async getRedCrossBranches(countryCode: string): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-static-input"."dashboard_redcross_branches" \
    where 0 = 0 \
    and "countryCode" = $1 \
    ';

    const rawResult: RedCrossBranch[] = await this.manager.query(query, [
      countryCode,
    ]);

    const result = this.toGeojson(rawResult);

    return result;
  }

  public async getRecentDates(countryCode: string): Promise<number> {
    const query =
      ' select to_date(date,\'yyyy-mm-dd\') as date \
    from "IBF-pipeline-output".dashboard_triggers_per_day \
    where country_code = $1 \
    order by date DESC \
    limit 1 \
    ';

    const result = await this.manager.query(query, [countryCode]);

    return result;
  }

  public async getTriggerPerLeadtime(countryCode: string): Promise<number> {
    const query =
      ' select * \
    from "IBF-API"."Trigger_per_lead_time" \
    where 0 = 0 \
    and country_code = $1 \
    ';

    const result = await this.manager.query(query, [countryCode]);

    return result[0];
  }

  public async getTriggeredAreas(
    countryCode: string,
  ): Promise<TriggeredArea[]> {
    const query = fs
      .readFileSync('./src/api/data/sql/get-triggered-areas.sql')
      .toString();

    const result = await this.manager.query(query, [countryCode]);
    return result;
  }

  public async getEventSummaryCountry(
    countryCodeISO3: string,
  ): Promise<EventSummaryCountry> {
    const query = fs
      .readFileSync('./src/api/data/sql/get-event-summary-country.sql')
      .toString();
    const result = await this.manager.query(query, [countryCodeISO3]);
    if (!result[0].startDate) {
      return null;
    }
    return result[0];
  }

  public toGeojson(rawResult): GeoJson {
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
}
