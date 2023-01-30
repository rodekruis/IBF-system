import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { GeoJson } from '../../shared/geo.model';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';
import { GlofasStationEntity } from './glofas-station.entity';
import { HelperService } from '../../shared/helper.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { CountryEntity } from '../country/country.entity';

@Injectable()
export class GlofasStationService {
  @InjectRepository(GlofasStationEntity)
  private readonly glofasStationRepository: Repository<GlofasStationEntity>;
  @InjectRepository(GlofasStationForecastEntity)
  private readonly glofasStationForecastRepository: Repository<
    GlofasStationForecastEntity
  >;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(private readonly helperService: HelperService) {}

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
    const lastTriggeredDate = await this.helperService.getRecentDate(
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
        'forecast."eapAlertClass" AS "eapAlertClass"',
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

  private async validateEapAlertClass(
    uploadTriggerPerStation: UploadTriggerPerStationDto,
  ) {
    const countrySettings = (
      await this.countryRepository.findOne({
        where: { countryCodeISO3: uploadTriggerPerStation.countryCodeISO3 },
        relations: ['countryDisasterSettings'],
      })
    ).countryDisasterSettings.find(d => d.disasterType === DisasterType.Floods);

    for await (const station of uploadTriggerPerStation.stationForecasts) {
      if (
        !Object.keys(countrySettings.eapAlertClasses).includes(
          station.eapAlertClass,
        )
      ) {
        throw new HttpException(
          'Data contains eapAlertClass that is not available for this country',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  public async uploadTriggerDataPerStation(
    uploadTriggerPerStation: UploadTriggerPerStationDto,
  ): Promise<GlofasStationForecastEntity[]> {
    await this.validateEapAlertClass(uploadTriggerPerStation);

    const stationForecasts: GlofasStationForecastEntity[] = [];
    for await (const station of uploadTriggerPerStation.stationForecasts) {
      const glofasStation = await this.glofasStationRepository.findOne({
        where: { stationCode: station.stationCode },
      });

      // Delete existing entries with same date, leadTime and countryCodeISO3 and stationCode
      await this.glofasStationForecastRepository.delete({
        glofasStation: glofasStation,
        leadTime: uploadTriggerPerStation.leadTime,
        date: uploadTriggerPerStation.date || new Date(),
      });

      const stationForecast = new GlofasStationForecastEntity();
      stationForecast.glofasStation = glofasStation;
      stationForecast.leadTime = uploadTriggerPerStation.leadTime;
      stationForecast.date = uploadTriggerPerStation.date || new Date();
      stationForecast.forecastLevel = station.forecastLevel;
      stationForecast.eapAlertClass = station.eapAlertClass;
      stationForecast.forecastReturnPeriod = station.forecastReturnPeriod;
      stationForecast.triggerLevel = station.triggerLevel;
      stationForecasts.push(stationForecast);
    }
    return await this.glofasStationForecastRepository.save(stationForecasts);
  }
}
