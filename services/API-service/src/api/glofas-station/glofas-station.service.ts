import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { GeoJson } from '../../shared/geo.model';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';
import { GlofasStationEntity } from './glofas-station.entity';
import { HelperService } from '../../shared/helper.service';
import { EventService } from '../event/event.service';
import { DisasterType } from '../disaster/disaster-type.enum';

@Injectable()
export class GlofasStationService {
  @InjectRepository(GlofasStationEntity)
  private readonly glofasStationRepository: Repository<GlofasStationEntity>;
  @InjectRepository(GlofasStationForecastEntity)
  private readonly glofasStationForecastRepository: Repository<
    GlofasStationForecastEntity
  >;

  public constructor(
    private readonly helperService: HelperService,
    private readonly eventService: EventService,
  ) {}

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
    const lastTriggeredDate = await this.eventService.getRecentDate(
      countryCodeISO3,
      DisasterType.Floods,
    );
    const stationForecasts = await this.glofasStationRepository
      .createQueryBuilder('station')
      .select([
        '"countryCodeISO3"',
        '"leadTime"',
        '"stationCode"',
        '"stationName"',
        'geom',
        'forecast."forecastLevel" AS "forecastLevel"',
        'forecast."forecastTrigger" AS "forecastTrigger"',
        'forecast."forecastProbability" AS "forecastProbability"',
        'forecast."forecastReturnPeriod" AS "forecastReturnPeriod"',
        'forecast."triggerLevel" AS "triggerLevel"',
      ])
      .leftJoin('station.stationForecasts', 'forecast')
      .where('"leadTime" = :leadTime', {
        leadTime: leadTime,
      })
      .andWhere('"countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .getRawMany();

    return this.helperService.toGeojson(stationForecasts);
  }

  public async uploadTriggerDataPerStation(
    uploadTriggerPerStation: UploadTriggerPerStationDto,
  ): Promise<GlofasStationForecastEntity[]> {
    const stationForecasts: GlofasStationForecastEntity[] = [];
    for await (const station of uploadTriggerPerStation.stationForecasts) {
      const glofasStation = await this.glofasStationRepository.findOne({
        where: { stationCode: station.stationCode },
      });

      // Delete existing entries with same date, leadTime and countryCodeISO3 and stationCode
      await this.glofasStationForecastRepository.delete({
        glofasStation: glofasStation,
        leadTime: uploadTriggerPerStation.leadTime,
        date: new Date(),
      });

      const stationForecast = new GlofasStationForecastEntity();
      stationForecast.glofasStation = glofasStation;
      stationForecast.leadTime = uploadTriggerPerStation.leadTime;
      stationForecast.date = new Date();
      stationForecast.forecastLevel = station.forecastLevel;
      stationForecast.forecastProbability = station.forecastProbability;
      stationForecast.forecastTrigger = station.forecastTrigger;
      stationForecast.forecastReturnPeriod = station.forecastReturnPeriod;
      stationForecast.triggerLevel = station.triggerLevel;
      stationForecasts.push(stationForecast);
    }
    return await this.glofasStationForecastRepository.save(stationForecasts);
  }
}
