/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import {
  GlofasStation,
  RedCrossBranch,
  GeoJson,
  GeoJsonFeature,
} from 'src/models/geo.model';
import {
  AdminAreaDataRecord,
  Aggregates,
  CountryMetaData,
  DisasterEvent,
  TriggeredArea,
} from 'src/models/data.model';

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
    const event = await this.getEvent(countryCode);
    let pcodes;
    if (event) {
      pcodes = (await this.getTriggeredAreas(event.id)).map(
        (area): string => "'" + area.pcode + "'",
      );
    }

    const query = (
      'select * \
    from "IBF-API"."Admin_area_data' +
      adminLevel +
      "\" \
    where 0 = 0 \
    and lead_time = $1 \
    and current_prev = 'Current' \
    and country_code = $2"
    ).concat(event ? ' and pcode in (' + pcodes.toString() + ')' : '');

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

  public async getTriggeredAreas(event: number): Promise<TriggeredArea[]> {
    const query =
      'select pcode,name,population_affected \
    from "IBF-pipeline-output".event_districts \
    where event = $1 \
    order by population_affected DESC';

    const result = await this.manager.query(query, [event]);

    return result;
  }

  public async getEvent(countryCode: string): Promise<DisasterEvent> {
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

    const event = await this.getEvent(countryCode);
    const activeTrigger = event && !event.end_date;
    indicators.find(
      (i): boolean => i.name === 'population_affected',
    ).active = activeTrigger;

    return indicators;
  }

  public async getMatrixAggregates(
    countryCode: string,
    adminLevel: number,
    leadTime: string,
  ): Promise<Aggregates> {
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

    let result: Aggregates = {
      population_affected: 0,
      vulnerability_index: 0,
      poverty_incidence: 0,
      female_head_hh: 0,
      population_u8: 0,
      population_over65: 0,
      wall_type: 0,
      roof_type: 0,
    };

    if (rawResult.length > 0) {
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
    }

    return result;
  }

  private sum(items, prop, cra): number {
    return items.reduce((a, b): number => {
      return a + (cra ? b.indicators[prop] : b[prop]);
    }, 0);
  }

  private sumProduct(items, prop, weightKey, cra): number {
    return items.reduce((a, b): number => {
      return a + b.indicators[weightKey] * (cra ? b.indicators[prop] : b[prop]);
    }, 0);
  }

  private sumProductExposed(items, prop, cra): number {
    return items.reduce((a, b): number => {
      return (
        a + b['population_affected'] * (cra ? b.indicators[prop] : b[prop])
      );
    }, 0);
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
