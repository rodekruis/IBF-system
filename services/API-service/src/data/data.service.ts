/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import {
  GlofasStation,
  RedcrossBranch,
  GeoJson,
  GeoJsonFeature,
} from 'src/models/geo.model';

@Injectable()
export class DataService {
  @InjectRepository(UserEntity)
  private manager: EntityManager;

  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

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
    leadTime: string,
  ): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-API"."Admin_area_data' +
      adminLevel +
      "\" \
    where 0 = 0 \
    and lead_time = $1 \
    and current_prev = 'Current' \
    and country_code = $2 \
    ";

    const rawResult: any[] = await this.manager.query(query, [
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

  public async getRedcrossBranches(countryCode: string): Promise<GeoJson> {
    const query =
      ' select * \
    from "IBF-static-input"."dashboard_redcross_branches" \
    where 0 = 0 \
    and country_code = $1 \
    ';

    const rawResult: RedcrossBranch[] = await this.manager.query(query, [
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

  public async getTriggeredAreas(event: number): Promise<any> {
    const query =
      'select pcode,name,population_affected \
    from "IBF-pipeline-output".event_districts \
    where event = $1 \
    order by population_affected DESC';

    const result = await this.manager.query(query, [event]);

    return result;
  }

  public async getEvent(countryCode: string): Promise<any> {
    const daysStickyAfterEvent = 0;

    const query =
      "select t0.* \
        from \"IBF-pipeline-output\".events t0 \
        left join( \
          select max(case when end_date is null then '9999-99-99' else end_date end) as max_date \
          , country_code \
      from \"IBF-pipeline-output\".events \
      group by country_code \
        ) t1 \
        on t0.country_code = t1.country_code \
        where t0.country_code = $1 \
        and(case when t0.end_date is null then '9999-99-99' else end_date end) = t1.max_date \
        and(end_date is null or to_date(end_date, 'yyyy-mm-dd') >= current_date - " +
      daysStickyAfterEvent +
      ') \
    ';

    const result = await this.manager.query(query, [countryCode]);

    return result[0];
  }

  public async getMetadata(countryCode: string): Promise<any> {
    const query =
      ' select * \
    from "IBF-API"."metadata" \
    where 0 = 0 \
    and country_code = $1 \
    ';

    return await this.manager.query(query, [countryCode]);
  }

  public async getMatrixAggregates(
    countryCode: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<any> {
    const query =
      ' select * \
    from "IBF-API"."Admin_area_data' +
      adminLevel +
      "\" \
    where 0 = 0 \
    and lead_time = $1 \
    and current_prev = 'Current' \
    and country_code = $2 \
    ";

    const rawResult = await this.manager.query(query, [leadTime, countryCode]);

    const indicators = await this.getMetadata(countryCode);

    const exposed = true; // Make this into an endpoint-parameter later

    const result = {};
    for (let indicator of indicators) {
      const cra = typeof rawResult[0][indicator.name] === 'undefined';
      if (exposed && indicator.weightedAvg) {
        if (indicator.weightedAvg) {
          result[indicator.name] = this.sumProductExposed(
            rawResult,
            indicator.name,
            cra,
          );
        }
      } else if (indicator.weightedAvg) {
        result[indicator.name] =
          this.sumProduct(rawResult, indicator.name, 'population', cra) /
          this.sum(rawResult, 'population', cra);
      } else {
        result[indicator.name] = this.sum(rawResult, indicator.name, cra);
      }
    }

    return result;
  }

  sum(items, prop, cra) {
    return items.reduce(function(a, b) {
      return a + (cra ? b.indicators[prop] : b[prop]);
    }, 0);
  }

  sumProduct(items, prop, weightKey, cra) {
    return items.reduce(function(a, b) {
      return a + b.indicators[weightKey] * (cra ? b.indicators[prop] : b[prop]);
    }, 0);
  }

  sumProductExposed(items, prop, cra) {
    return items.reduce(function(a, b) {
      return (
        a + b['population_affected'] * (cra ? b.indicators[prop] : b[prop])
      );
    }, 0);
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
