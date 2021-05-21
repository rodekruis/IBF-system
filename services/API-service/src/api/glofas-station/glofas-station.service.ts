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
            where: { countryCodeISO3: countryCodeISO3 },
        });
    }

    public async uploadTriggerDataPerStation(
        uploadTriggerPerStation: UploadTriggerPerStationDto,
    ): Promise<GlofasStationTriggerEntity[]> {
        const stationForecasts: GlofasStationTriggerEntity[] = [];
        for await (let station of uploadTriggerPerStation.stationForecasts) {
            // Delete existsing entries with same date, leadTime and countryCodeISO3 and stationCode
            await this.glofasStationTriggerRepository.delete({
                stationCode: station.stationCode,
                countryCodeISO3: uploadTriggerPerStation.countryCodeISO3,
                leadTime: uploadTriggerPerStation.leadTime,
                date: new Date(),
            });

            const stationForecast = new GlofasStationTriggerEntity();
            stationForecast.stationCode = station.stationCode;
            stationForecast.leadTime = uploadTriggerPerStation.leadTime;
            stationForecast.countryCodeISO3 =
                uploadTriggerPerStation.countryCodeISO3;
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
