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
import { validate } from 'class-validator';
import { UploadStationDto } from './dto/upload-station.dto';

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
        date: uploadTriggerPerStation.date || new Date(),
      });

      const stationForecast = new GlofasStationForecastEntity();
      stationForecast.glofasStation = glofasStation;
      stationForecast.leadTime = uploadTriggerPerStation.leadTime;
      stationForecast.date = uploadTriggerPerStation.date || new Date();
      stationForecast.forecastLevel = station.forecastLevel;
      stationForecast.forecastProbability = station.forecastProbability;
      stationForecast.forecastReturnPeriod = station.forecastReturnPeriod;
      stationForecast.triggerLevel = station.triggerLevel;
      stationForecasts.push(stationForecast);
    }
    return await this.glofasStationForecastRepository.save(stationForecasts);
  }

  public async uploadJson(
    countryCodeISO3: string,
    newStations: UploadStationDto[],
  ) {
    for (const station of newStations) {
      const existingStation = await this.glofasStationRepository.findOne({
        where: {
          countryCodeISO3: countryCodeISO3,
          stationCode: station.stationCode,
        },
      });
      if (existingStation) {
        this.glofasStationRepository
          .createQueryBuilder()
          .update()
          .set({
            stationName: station.stationName,
            lat: String(station.lat),
            lon: String(station.lon),
            geom: (): string =>
              `st_asgeojson(st_MakePoint(${station.lon}, ${station.lat}))::json`,
          })
          .where({
            countryCodeISO3: countryCodeISO3,
            stationCode: station.stationCode,
          })
          .execute();
      } else {
        this.glofasStationRepository
          .createQueryBuilder()
          .insert()
          .values({
            countryCodeISO3: countryCodeISO3,
            stationCode: station.stationCode,
            stationName: station.stationName,
            lat: String(station.lat),
            lon: String(station.lon),
            geom: (): string =>
              `st_asgeojson(st_MakePoint(${station.lon}, ${station.lat}))::json`,
          })
          .execute();
      }
    }

    const existingStations = await this.glofasStationRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
    const newStationCodes = newStations.map(s => s.stationCode);
    for (const station of existingStations) {
      if (!newStationCodes.includes(station.stationCode)) {
        await this.glofasStationForecastRepository.delete({
          glofasStation: { id: station.id },
        });
        await this.glofasStationRepository.remove(station);
      }
    }
  }

  public async uploadCsv(data, countryCodeISO3: string): Promise<void> {
    const objArray = await this.helperService.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(objArray);

    await this.uploadJson(countryCodeISO3, validatedObjArray);
  }

  public async validateArray(csvArray): Promise<UploadStationDto[]> {
    const errors = [];
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const dto = new UploadStationDto();
      dto.stationCode = row.station_code;
      dto.stationName = row.station_name;
      dto.lat = row.lat;
      dto.lon = row.lon;
      const result = await validate(dto);
      if (result.length > 0) {
        const errorObj = { lineNumber: i + 1, validationError: result };
        errors.push(errorObj);
      }
      validatatedArray.push(dto);
    }
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return validatatedArray;
  }
}
