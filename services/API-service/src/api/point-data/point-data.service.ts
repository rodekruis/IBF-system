import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import { IsNull, MoreThanOrEqual, Repository } from 'typeorm';

import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { DisasterType } from '../disaster/disaster-type.enum';
import { WhatsappService } from '../notification/whatsapp/whatsapp.service';
import {
  UploadAssetExposureStatusDto,
  UploadDynamicPointDataDto,
} from './dto/upload-asset-exposure-status.dto';
import { CommunityNotificationDto } from './dto/upload-community-notifications.dto';
import { DamSiteDto } from './dto/upload-dam-sites.dto';
import { EvacuationCenterDto } from './dto/upload-evacuation-centers.dto';
import { GaugeDto } from './dto/upload-gauge.dto';
import { UploadGlofasStationDynamicOldFormatDto } from './dto/upload-glofas-station-old-format';
import { GlofasStationDto } from './dto/upload-glofas-station.dto';
import { HealthSiteDto } from './dto/upload-health-sites.dto';
import { RedCrossBranchDto } from './dto/upload-red-cross-branch.dto';
import { SchoolDto } from './dto/upload-schools.dto';
import { WaterpointDto } from './dto/upload-waterpoint.dto';
import { DynamicPointDataEntity } from './dynamic-point-data.entity';
import { PointDataEntity, PointDataEnum } from './point-data.entity';

export interface CommunityNotification {
  nameVolunteer: string;
  nameVillage: string;
  disasterType: string;
  description: string;
  end: Date;
  _attachments: [{ download_url: string }];
  _geolocation: [number, number];
}

@Injectable()
export class PointDataService {
  @InjectRepository(PointDataEntity)
  private readonly pointDataRepository: Repository<PointDataEntity>;
  @InjectRepository(DynamicPointDataEntity)
  private readonly dynamicPointDataRepository: Repository<DynamicPointDataEntity>;

  public constructor(
    private readonly helperService: HelperService,
    private readonly whatsappService: WhatsappService,
  ) {}

  public async getPointDataByCountry(
    pointDataCategory: PointDataEnum,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<GeoJson> {
    const attributes = [];
    const dto = this.getDtoPerPointDataCategory(pointDataCategory);
    for (const attribute in dto) {
      if (dto.hasOwnProperty(attribute)) {
        attributes.push(attribute);
      }
    }
    const selectColumns = attributes.map(
      (attribute) => `point.attributes->'${attribute}' AS "${attribute}"`,
    );
    selectColumns.push('geom');
    selectColumns.push('"pointDataId"');

    const recentDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

    // Subquery to get the max timestamp for each point, to be able to only get the most recent data ..
    // .. and also suffixes the leadTime, only to pick the max leadTime incase of multiple records with same timestamp ..
    // .. which makes sure that in the warning-to-trigger scenario the trigger data of Glofas stations is shown, not the warning data
    const maxTimestampPerPointQuery = this.dynamicPointDataRepository
      .createQueryBuilder('sub')
      .select([
        'sub."pointPointDataId"',
        `MAX(sub.timestamp || '_' || COALESCE(sub."leadTime",'0')) as maxTimestampLeadTime`,
      ])
      .where('sub.timestamp >= :cutoffMoment', {
        cutoffMoment: this.helperService.getUploadCutoffMoment(
          disasterType,
          recentDate.timestamp,
        ),
      })
      .groupBy('sub."pointPointDataId"');

    const pointDataQuery = this.pointDataRepository
      .createQueryBuilder('point')
      .select(selectColumns)
      .where({
        pointDataCategory: pointDataCategory,
        countryCodeISO3: countryCodeISO3,
      })
      .leftJoin(
        (subquery) => {
          return subquery
            .select([
              'dynamic."pointPointDataId"',
              'json_object_agg("key",value) as "dynamicData"',
            ])
            .from(DynamicPointDataEntity, 'dynamic')
            .innerJoin(
              `(${maxTimestampPerPointQuery.getQuery()})`,
              'maxSub',
              `dynamic."pointPointDataId" = "maxSub"."pointPointDataId" 
                AND (dynamic.timestamp || '_' || COALESCE(dynamic."leadTime",'0')) = "maxSub".maxTimestampLeadTime`,
            )
            .setParameters(maxTimestampPerPointQuery.getParameters())
            .groupBy('dynamic."pointPointDataId"');
        },
        'dynamic',
        'dynamic."pointPointDataId" = point."pointDataId"',
      )
      .addSelect('dynamic."dynamicData" as "dynamicData"');

    const pointData = await pointDataQuery.getRawMany();
    return this.helperService.toGeojson(pointData);
  }

  private getDtoPerPointDataCategory(pointDataCategory: PointDataEnum) {
    switch (pointDataCategory) {
      case PointDataEnum.dams:
        return new DamSiteDto();
      case PointDataEnum.evacuationCenters:
        return new EvacuationCenterDto();
      case PointDataEnum.healthSites:
        return new HealthSiteDto();
      case PointDataEnum.redCrossBranches:
        return new RedCrossBranchDto();
      case PointDataEnum.communityNotifications:
        return new CommunityNotificationDto();
      case PointDataEnum.schools:
        return new SchoolDto();
      case PointDataEnum.waterpointsInternal:
        return new WaterpointDto();
      case PointDataEnum.gauges:
        return new GaugeDto();
      case PointDataEnum.glofasStations:
        return new GlofasStationDto();
      default:
        throw new HttpException(
          'Not a known point layer',
          HttpStatus.NOT_FOUND,
        );
    }
  }

  public async uploadJson(
    pointDataCategory: PointDataEnum,
    countryCodeISO3: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validatedObjArray: any,
    deleteExisting = true,
  ) {
    // Delete existing entries
    if (deleteExisting) {
      await this.pointDataRepository.delete({
        countryCodeISO3: countryCodeISO3,
        pointDataCategory: pointDataCategory,
      });
    }

    const dataArray = validatedObjArray.map((point) => {
      const pointAttributes = JSON.parse(JSON.stringify(point)); // hack: clone without referencing
      delete pointAttributes['lat'];
      delete pointAttributes['lon'];
      return {
        countryCodeISO3: countryCodeISO3,
        referenceId: point.fid || null,
        pointDataCategory: pointDataCategory,
        attributes: JSON.parse(JSON.stringify(pointAttributes)),
        geom: (): string =>
          `st_asgeojson(st_MakePoint(${point.lon}, ${point.lat}))::json`,
      };
    });
    await this.pointDataRepository.save(dataArray, { chunk: 100 });
  }

  public async uploadCsv(
    data,
    pointDataCategory: PointDataEnum,
    countryCodeISO3: string,
  ): Promise<void> {
    const objArray = await this.helperService.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(
      pointDataCategory,
      objArray,
    );

    await this.uploadJson(
      pointDataCategory,
      countryCodeISO3,
      validatedObjArray,
    );
  }

  public async validateArray(
    pointDataCategory: PointDataEnum,
    csvArray,
  ): Promise<object[]> {
    const errors = [];
    const validatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const dto = this.getDtoPerPointDataCategory(pointDataCategory);
      for (const attribute in dto) {
        if (dto.hasOwnProperty(attribute)) {
          dto[attribute] = row[attribute];
        }
      }
      dto.lat = row.lat;
      dto.lon = row.lon;
      const result = await validate(dto);
      if (result.length > 0) {
        const errorObj = { lineNumber: i + 1, validationError: result };
        errors.push(errorObj);
      }
      validatedArray.push(dto);
    }
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return validatedArray;
  }

  public async dismissCommunityNotification(pointDataId: string) {
    const notification = await this.pointDataRepository.findOne({
      where: { pointDataId: pointDataId },
    });
    if (!notification) {
      throw new HttpException(
        { error: 'point not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    notification.attributes['dismissed'] = true;
    await this.pointDataRepository.save(notification);
  }

  public async uploadCommunityNotification(
    countryCodeISO3: string,
    communityNotification: CommunityNotification,
  ): Promise<void> {
    const notification = new CommunityNotificationDto();
    notification.nameVolunteer = communityNotification['nameVolunteer'];
    notification.nameVillage = communityNotification['nameVillage'];
    notification.type = communityNotification['disasterType'];
    notification.description = communityNotification['description'];
    notification.uploadTime = communityNotification['end'];
    try {
      notification.photoUrl =
        communityNotification['_attachments'][0]['download_url'];
    } catch (e) {
      notification.photoUrl = null;
    }
    notification.lat = communityNotification['_geolocation'][0];
    notification.lon = communityNotification['_geolocation'][1];

    await this.uploadJson(
      PointDataEnum.communityNotifications,
      countryCodeISO3,
      [notification],
      false,
    );

    await this.whatsappService.sendCommunityNotification(countryCodeISO3);
  }

  // The old endpoint is left in for a grace period, and here the input is transformed to the required input for the new endpoint
  public async uploadAssetExposureStatus(
    assetFids: UploadAssetExposureStatusDto,
  ) {
    const dynamicPointData = new UploadDynamicPointDataDto();
    dynamicPointData.date = assetFids.date;
    dynamicPointData.leadTime = assetFids.leadTime;
    dynamicPointData.disasterType = assetFids.disasterType;
    dynamicPointData.key = 'exposure';
    dynamicPointData.dynamicPointData = assetFids.exposedFids.map((fid) => {
      return { fid: fid, value: 'true' };
    });
    await this.uploadDynamicPointData(dynamicPointData);
  }

  async uploadDynamicPointData(dynamicPointData: UploadDynamicPointDataDto) {
    const dynamicPointDataArray: DynamicPointDataEntity[] = [];

    for (const point of dynamicPointData.dynamicPointData) {
      const asset = await this.pointDataRepository.findOne({
        where: {
          referenceId: point.fid,
          pointDataCategory: dynamicPointData.pointDataCategory,
        },
      });
      if (!asset) {
        continue;
      }

      // Delete existing entries
      await this.dynamicPointDataRepository.delete({
        point: { pointDataId: asset.pointDataId },
        leadTime: dynamicPointData.leadTime || IsNull(), // For Glofas stations, we should overwrite irregardless of lead time, but I'm not sure about other uses, so instead solving this in GET endpoint query, by making sure we only use the most recent timestam per point
        key: dynamicPointData.key,
        timestamp: MoreThanOrEqual(
          this.helperService.getUploadCutoffMoment(
            dynamicPointData.disasterType,
            dynamicPointData.date || new Date(),
          ),
        ),
      });

      const dynamicPoint = new DynamicPointDataEntity();
      dynamicPoint.key = dynamicPointData.key;
      dynamicPoint.leadTime = dynamicPointData.leadTime;
      dynamicPoint.timestamp = dynamicPointData.date || new Date();
      dynamicPoint.value = point.value;
      dynamicPoint.point = asset;
      dynamicPointDataArray.push(dynamicPoint);
    }
    await this.dynamicPointDataRepository.save(dynamicPointDataArray);
  }

  // Refactor: This function is used to map Glofas station dynamic mock data, which is still in format of old endpoint, to format of new endpoint
  // The mock data should be updated to the new format, and then this function can be removed
  public async reformatAndUploadOldGlofasStationData(
    uploadTriggerPerStation: UploadGlofasStationDynamicOldFormatDto,
  ): Promise<void> {
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
      await this.uploadDynamicPointData(payload);
    }
  }
}
