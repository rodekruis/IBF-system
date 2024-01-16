import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadTriggerPerStationDto } from './dto/upload-trigger-per-station';
import { DisasterType } from '../disaster/disaster-type.enum';
import { CountryEntity } from '../country/country.entity';
import { PointDataService } from '../point-data/point-data.service';
import { UploadDynamicPointDataDto } from '../point-data/dto/upload-asset-exposure-status.dto';
import { GlofasStationEntityDto } from './dto/glofas-station-entity.dto';
import { PointDataEnum } from '../point-data/point-data.entity';

@Injectable()
export class GlofasStationService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(private readonly pointDataService: PointDataService) {}

  public async getStationsByCountry(countryCodeISO3: string): Promise<any[]> {
    const stations = await this.pointDataService.getPointDataByCountry(
      PointDataEnum.glofasStations,
      countryCodeISO3,
      DisasterType.Floods,
    );
    return stations.features.map((s) => {
      return {
        id: s.properties['pointDataId'],
        countryCodeISO3: countryCodeISO3,
        stationCode: s.properties['stationCode'],
        stationName: s.properties['stationName'],
        lat: String(s.geometry.coordinates[1]),
        lon: String(s.geometry.coordinates[0]),
        geom: s.geometry,
      };
    });
  }

  private async validateEapAlertClass(
    uploadTriggerPerStation: UploadTriggerPerStationDto,
  ) {
    const countrySettings = (
      await this.countryRepository.findOne({
        where: { countryCodeISO3: uploadTriggerPerStation.countryCodeISO3 },
        relations: ['countryDisasterSettings'],
      })
    ).countryDisasterSettings.find(
      (d) => d.disasterType === DisasterType.Floods,
    );

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
  ): Promise<void> {
    await this.validateEapAlertClass(uploadTriggerPerStation);

    const keys = [
      'forecastLevel',
      'forecastReturnPeriod',
      'triggerLevel',
      'eapAlertClass',
    ];
    const date = uploadTriggerPerStation.date || new Date();
    for await (const key of keys) {
      const payload = new UploadDynamicPointDataDto();
      payload.key = key;
      payload.leadTime = uploadTriggerPerStation.leadTime;
      payload.date = date;
      payload.disasterType = DisasterType.Floods;
      payload.dynamicPointData = uploadTriggerPerStation.stationForecasts.map(
        (f) => {
          return { fid: f.stationCode, value: f[key] };
        },
      );
      await this.pointDataService.uploadDynamicPointData(payload);
    }
  }
}
