import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { Station } from 'src/models/station.model';

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

  public async getStations(
    countryCode: string,
    currentPrev: string,
    leadTime: string,
  ): Promise<Station[]> {
    const query =
      ' select dgsv.station_code as code \
      , dgsv.station_name as name \
      , dgsv.geom \
      , dgsv.trigger_level as "triggerLevel" \
		  , dfps.fc as "forecastLevel" \
      , dfps.fc_trigger as "triggerInd" \
      , dfps.fc_perc as "triggerPerc" \
      , dfps.fc_prob as "triggerProb" \
    from "IBF-pipeline-output".dashboard_glofas_stations_v2 dgsv \
    left join "IBF-pipeline-output".dashboard_forecast_per_station dfps on dgsv.station_code = dfps.station_code \
    where 0 = 0 \
    and current_prev = $1 \
    and lead_time = $2 \
    ';

    const result: Station[] = await this.manager.query(query, [
      currentPrev,
      leadTime,
    ]);
    return result;
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
