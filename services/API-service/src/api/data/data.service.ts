import { CountryEvent } from './data.model';
/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import {
  AdminAreaDataRecord,
  CountryMetaData,
  DisasterEvent,
  TriggeredArea,
} from './data.model';
import {
  GeoJson,
  GeoJsonFeature,
  GlofasStation,
  RedCrossBranch,
} from './geo.model';

@Injectable()
export class DataService {
  @InjectRepository(UserEntity)
  private manager: EntityManager;

  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

  public async getAdminAreaData(
    countryCode: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<GeoJson> {
    let pcodes;
    pcodes = (await this.getTriggeredAreas(countryCode)).map(
      (area): string => "'" + area.pcode + "'",
    );
    const query = (
      'select * \
    from "IBF-API"."Admin_area_data' +
      adminLevel +
      "\" \
    where 0 = 0 \
    and lead_time = $1 \
    and current_prev = 'Current' \
    and country_code = $2"
    ).concat(
      pcodes.length > 0 ? ' and pcode in (' + pcodes.toString() + ')' : '',
    );
    const rawResult: AdminAreaDataRecord[] = await this.manager.query(query, [
      leadTime,
      countryCode,
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
    and country_code = $1 \
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
    from "IBF-pipeline-output".triggers_per_day \
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
    const query = `select
    *
  from
    (
    select
      e.pcode,
      coalesce(a2.name, a1.name) as name,
      coalesce(a2.population_affected, a1.population_affected) as population_affected,
      e.id
    from
      "IBF-pipeline-output".event_pcode e
    left join "IBF-API"."Admin_area_data2" a2 on
      a2.pcode = e.pcode
      and a2.country_code = $1
      and a2.name is not null
      and a2.current_prev = 'Current'
    left join "IBF-API"."Admin_area_data1" a1 on
      a1.pcode = e.pcode
      and a1.current_prev = 'Current'
      and a1.name is not null
      and a1.country_code = $2
    where
      closed = false
    group by
      e.pcode,
      a2.population_affected,
      a1.population_affected,
      a2.name,
      a1.name,
      e.id
    order by
      population_affected desc ) as ec
  where
    name is not null
      `;

    const result = await this.manager.query(query, [countryCode, countryCode]);
    return result;
  }

  public async getCountryEvent(countryCode: string): Promise<CountryEvent> {
    const query = `
    select
      max(end_date) as end_date,
      min(start_date) as start_date,
      max(country_code) as country_code
    from
      (
      select
        e.pcode,
        coalesce(a2.country_code , a1.country_code) as country_code,
        coalesce(a2.population_affected, a1.population_affected) as population_affected,
        e.end_date,
        e.start_date 
      from
        "IBF-pipeline-output".event_pcode e
      left join "IBF-API"."Admin_area_data2" a2 on
        a2.pcode = e.pcode
        and a2.current_prev = 'Current'
        and a2.country_code is not null
      left join "IBF-API"."Admin_area_data1" a1 on
        a1.pcode = e.pcode
        and a1.current_prev = 'Current'
        and a1.country_code is not null
      where
        closed = false
      group by
        e.pcode,
        a2.population_affected,
        a1.population_affected,
        a2.country_code,
        a1.country_code,
        e.end_date,
        e.start_date 
      order by
        population_affected desc ) as event_pcode_country where country_code = $1
          `;
    const result = await this.manager.query(query, [countryCode]);
    return result[0];
  }

  public async getMetadata(countryCode: string): Promise<CountryMetaData[]> {
    const query =
      ' select * \
    from "IBF-app"."indicator" \
    where 0 = 0 \
    and country_code like \'%' +
      countryCode +
      "%' \
    ";

    const indicators = await this.manager.query(query);

    const event = await this.getCountryEvent(countryCode);
    const activeTrigger = event && !event.end_date;
    indicators.find(
      (i): boolean => i.name === 'population_affected',
    ).active = activeTrigger;

    return indicators;
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
