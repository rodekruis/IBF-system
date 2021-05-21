import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { GeoJson } from '../../shared/geo.model';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';
import { GlofasStationEntity } from './glofas-station.entity';
import { HelperService } from '../../shared/helper.service';

@Injectable()
export class GlofasStationService {
  @InjectRepository(GlofasStationEntity)
  private readonly glofasStationRepository: Repository<GlofasStationEntity>;
  @InjectRepository(GlofasStationForecastEntity)
  private readonly glofasStationForecastRepository: Repository<
    GlofasStationForecastEntity
  >;

  private readonly helperService: HelperService;

  public constructor(helperService: HelperService) {
    this.helperService = helperService;
  }

  public async getStationsByCountry(
    countryCodeISO3: string,
  ): Promise<GlofasStationEntity[]> {
    return await this.glofasStationRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
  }

  public async getStationForecastByLeadTime(
    countryCodeISO3: string,
    leadTime: LeadTime,
  ): Promise<GeoJson> {
    const stationForecasts = await this.glofasStationRepository
      .createQueryBuilder('station')
      .select([
        '"countryCodeISO3"',
        '"leadTime"',
        '"stationCode"',
        '"stationName"',
        '"triggerLevel"',
        'geom',
        'forecast."forecastLevel" AS "forecastLevel"',
        'forecast."forecastTrigger" AS "forecastTrigger"',
        'forecast."forecastProbability" AS "forecastProbability"',
      ])
      .leftJoin('station.stationForecasts', 'forecast')
      .where('"leadTime" = :leadTime', {
        leadTime: leadTime,
      })
      .andWhere('"countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('date = current_date')
      .getRawMany();

    return this.helperService.toGeojson(stationForecasts);
  }

  public async uploadTriggerDataPerStation(
    uploadTriggerPerStation: UploadTriggerPerStationDto,
  ): Promise<GlofasStationForecastEntity[]> {
    const stationForecasts: GlofasStationForecastEntity[] = [];
    for await (let station of uploadTriggerPerStation.stationForecasts) {
      // Delete existsing entries with same date, leadTime and countryCodeISO3 and stationCode
      await this.glofasStationForecastRepository.delete({
        glofasStation: { stationCode: station.stationCode },
        leadTime: uploadTriggerPerStation.leadTime,
        date: new Date(),
      });

      const stationForecast = new GlofasStationForecastEntity();
      const glofasStation = await this.glofasStationRepository.findOne({
        where: { stationCode: station.stationCode },
      });
      stationForecast.glofasStation = glofasStation;
      stationForecast.leadTime = uploadTriggerPerStation.leadTime;
      stationForecast.date = new Date();
      stationForecast.forecastLevel = station.forecastLevel;
      stationForecast.forecastProbability = station.forecastProbability;
      stationForecast.forecastTrigger = station.forecastTrigger;
      stationForecast.forecastReturnPeriod = station.forecastReturnPeriod;
      stationForecasts.push(stationForecast);
    }
    return await this.glofasStationForecastRepository.save(stationForecasts);
  }
}
