import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { GlofasStationTriggerEntity } from './glofas-station-trigger.entity';
import { GlofasStationEntity } from './glofas-station.entity';

@Injectable()
export class GlofasStationService {
  @InjectRepository(GlofasStationEntity)
  private readonly glofasStationRepository: Repository<GlofasStationEntity>;
  @InjectRepository(GlofasStationTriggerEntity)
  private readonly glofasStationTriggerRepository: Repository<
    GlofasStationTriggerEntity
  >;

  public constructor() {}

  public async getStationsByCountry(
    countryCodeISO3,
  ): Promise<GlofasStationEntity[]> {
    return await this.glofasStationRepository.find({
      where: { countryCode: countryCodeISO3 },
    });
  }

  public async uploadTriggerDataPerStation(
    uploadTriggerPerStationArray: UploadTriggerPerStationDto[],
  ): Promise<GlofasStationTriggerEntity[]> {
    const stationForecasts: GlofasStationTriggerEntity[] = [];
    for await (let station of uploadTriggerPerStationArray) {
      // Delete existsing entries with same date, leadTime and countryCode and stationCode
      await this.glofasStationTriggerRepository.delete({
        stationCode: station.stationCode,
        countryCodeISO3: station.countryCodeISO3,
        leadTime: station.leadTime,
        date: new Date(),
      });

      const stationForecast = new GlofasStationTriggerEntity();
      stationForecast.stationCode = station.stationCode;
      stationForecast.leadTime = station.leadTime;
      stationForecast.countryCodeISO3 = station.countryCodeISO3;
      stationForecast.date = new Date();
      stationForecast.forecastLevel = station.forecastLevel;
      stationForecast.forecastProbability = station.forecastProbability;
      stationForecast.forecastTrigger = station.forecastTrigger;
      stationForecast.forecastReturnPeriod = station.forecastReturnPeriod;
      stationForecasts.push(stationForecast);
    }
    return await this.glofasStationTriggerRepository.save(stationForecasts);
  }
}
