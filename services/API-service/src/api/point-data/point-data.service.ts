import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import { IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { FeatureCollection } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { WhatsappService } from '../notification/whatsapp/whatsapp.service';
import { UploadDynamicPointDataDto } from './dto/upload-asset-exposure-status.dto';
import {
  CommunityNotificationDto,
  CommunityNotificationExternalDto,
} from './dto/upload-community-notifications.dto';
import { DamSiteDto } from './dto/upload-dam-sites.dto';
import { EvacuationCenterDto } from './dto/upload-evacuation-centers.dto';
import { GaugeDto } from './dto/upload-gauge.dto';
import { GlofasStationDto } from './dto/upload-glofas-station.dto';
import { UploadGlofasStationDynamicOldFormatDto } from './dto/upload-glofas-station-old-format';
import { HealthSiteDto } from './dto/upload-health-sites.dto';
import { RedCrossBranchDto } from './dto/upload-red-cross-branch.dto';
import { SchoolDto } from './dto/upload-schools.dto';
import { WaterpointDto } from './dto/upload-waterpoint.dto';
import { DynamicPointDataEntity } from './dynamic-point-data.entity';
import { PointDataCategory, PointDataEntity } from './point-data.entity';

export interface PointDto
  extends DamSiteDto,
    EvacuationCenterDto,
    HealthSiteDto,
    RedCrossBranchDto,
    CommunityNotificationDto,
    SchoolDto,
    WaterpointDto,
    GaugeDto,
    GlofasStationDto {}

@Injectable()
export class PointDataService {
  private logger = new Logger('PointDataService');

  @InjectRepository(PointDataEntity)
  private readonly pointDataRepository: Repository<PointDataEntity>;
  @InjectRepository(DynamicPointDataEntity)
  private readonly dynamicPointDataRepository: Repository<DynamicPointDataEntity>;

  public constructor(
    private readonly helperService: HelperService,
    private readonly whatsappService: WhatsappService,
  ) {}

  public async getPointDataByCountry(
    pointDataCategory: PointDataCategory,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<FeatureCollection> {
    const attributes = [];
    const pointDto = this.getPointDto(pointDataCategory);

    // TODO: figure out why the for-loop is needed, its purpose is unclear
    for (const attribute in pointDto) {
      if (pointDto.hasOwnProperty(attribute)) {
        attributes.push(attribute);
      }
    }
    const selectColumns = attributes.map(
      (attribute) => `point.attributes->'${attribute}' AS "${attribute}"`,
    );
    selectColumns.push('geom');
    selectColumns.push('"pointDataId"');

    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );

    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      disasterType,
      lastUploadDate.timestamp,
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
      .where('sub.timestamp >= :uploadCutoffMoment', { uploadCutoffMoment })
      .groupBy('sub."pointPointDataId"');

    const pointDataQuery = this.pointDataRepository
      .createQueryBuilder('point')
      .select(selectColumns)
      .where({ pointDataCategory, countryCodeISO3, active: true })
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

    return this.helperService.getFeatureCollection(pointData);
  }

  private getPointDto(pointDataCategory: PointDataCategory) {
    switch (pointDataCategory) {
      case PointDataCategory.dams:
        return new DamSiteDto();
      case PointDataCategory.evacuationCenters:
        return new EvacuationCenterDto();
      case PointDataCategory.healthSites:
        return new HealthSiteDto();
      case PointDataCategory.redCrossBranches:
        return new RedCrossBranchDto();
      case PointDataCategory.communityNotifications:
        return new CommunityNotificationDto();
      case PointDataCategory.schools:
        return new SchoolDto();
      case PointDataCategory.waterpointsInternal:
        return new WaterpointDto();
      case PointDataCategory.gauges:
        return new GaugeDto();
      case PointDataCategory.glofasStations:
        return new GlofasStationDto();
      default:
        throw new HttpException(
          'Not a known point layer',
          HttpStatus.NOT_FOUND,
        );
    }
  }

  public async uploadJson(
    pointDataCategory: PointDataCategory,
    countryCodeISO3: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pointDtos: any, // REFACTOR: PointDto[],
    deactivateExisting = true,
  ) {
    // Deactivate existing entries
    if (deactivateExisting) {
      await this.pointDataRepository.update(
        { countryCodeISO3, pointDataCategory },
        { active: false },
      );
    }

    const pointDataEntities = pointDtos.map((pointDto: PointDto) => {
      const pointAttributes = JSON.parse(JSON.stringify(pointDto));
      delete pointAttributes['lat'];
      delete pointAttributes['lon'];

      return {
        countryCodeISO3,
        referenceId: pointDto.fid || null,
        pointDataCategory,
        attributes: JSON.parse(JSON.stringify(pointAttributes)),
        active: true,
        geom: (): string =>
          `st_asgeojson(st_MakePoint(${pointDto.lon}, ${pointDto.lat}))::json`,
      };
    });

    await this.pointDataRepository.save(pointDataEntities, { chunk: 100 });
  }

  public async uploadCsv(
    file: Express.Multer.File,
    pointDataCategory: PointDataCategory,
    countryCodeISO3: string,
  ): Promise<void> {
    const pointCsv = await this.helperService.getCsvData<PointDto>(file);

    const pointDtos = await this.getPointDtos(pointDataCategory, pointCsv);

    await this.uploadJson(pointDataCategory, countryCodeISO3, pointDtos);
  }

  // NOTE: point data category are individual types of point data
  // see PointDataCategory enum for the supported categories
  public async getPointDtos(
    pointDataCategory: PointDataCategory,
    pointCsv: PointDto[], // REFACTOR: create PointCsv to avoid this mismatch
  ) {
    const validationErrors = [];
    const pointDtos = [];

    for (const [i, point] of pointCsv.entries()) {
      const pointDto = this.getPointDto(pointDataCategory);

      // TODO: figure out why the for-loop is needed, its purpose is unclear
      for (const attribute in pointDto) {
        if (pointDto.hasOwnProperty(attribute)) {
          pointDto[attribute] = point[attribute];
        }
      }

      pointDto.lat = point.lat;
      pointDto.lon = point.lon;

      const validationError = await validate(pointDto);
      if (validationError.length > 0) {
        this.logger.error(
          `Seed point data validation error: ${validationError}`,
        );
        validationErrors.push({ lineNumber: i + 1, validationError });
      }

      pointDtos.push(pointDto);
    }

    if (validationErrors.length > 0) {
      throw new HttpException(validationErrors, HttpStatus.BAD_REQUEST);
    }

    return pointDtos;
  }

  public async dismissCommunityNotification(pointDataId: string) {
    const notification = await this.pointDataRepository.findOne({
      where: { pointDataId },
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
    communityNotification: CommunityNotificationExternalDto,
  ): Promise<void> {
    const notification = new CommunityNotificationDto();
    notification.nameVolunteer = communityNotification.nameVolunteer;
    notification.nameVillage = communityNotification.nameVillage;
    notification.type = communityNotification.disasterType;
    notification.description = communityNotification.description;
    notification.uploadTime = communityNotification.end;
    try {
      notification.photoUrl =
        communityNotification._attachments[0].download_url;
    } catch {
      notification.photoUrl = null;
    }
    notification.lat = communityNotification._geolocation[0];
    notification.lon = communityNotification._geolocation[1];

    await this.uploadJson(
      PointDataCategory.communityNotifications,
      countryCodeISO3,
      [notification],
      false,
    );

    await this.whatsappService.sendCommunityNotification(countryCodeISO3);
  }

  async uploadDynamicPointData({
    countryCodeISO3,
    disasterType,
    leadTime,
    date,
    key,
    dynamicPointData,
    pointDataCategory,
  }: UploadDynamicPointDataDto) {
    const dynamicPointDataArray: DynamicPointDataEntity[] = [];

    for (const { fid: referenceId, value } of dynamicPointData) {
      const asset = await this.pointDataRepository.findOne({
        where: {
          referenceId,
          countryCodeISO3,
          pointDataCategory,
          active: true,
        },
      });
      if (!asset) {
        continue;
      }

      const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
        disasterType,
        date || new Date(),
      );

      // Delete existing entries
      await this.dynamicPointDataRepository.delete({
        point: { pointDataId: asset.pointDataId },
        leadTime: leadTime || IsNull(), // For Glofas stations, we should overwrite irregardless of lead time, but I'm not sure about other uses, so instead solving this in GET endpoint query, by making sure we only use the most recent timestam per point
        key,
        timestamp: MoreThanOrEqual(uploadCutoffMoment),
      });

      const dynamicPoint = new DynamicPointDataEntity();

      dynamicPoint.key = key;
      dynamicPoint.leadTime = leadTime;
      dynamicPoint.timestamp = date || new Date();
      dynamicPoint.value = value;
      dynamicPoint.point = asset;

      dynamicPointDataArray.push(dynamicPoint);
    }

    return this.dynamicPointDataRepository.save(dynamicPointDataArray);
  }

  // REFACTOR: This function is used to map Glofas station dynamic mock data, which is still in format of old endpoint, to format of new endpoint
  // The mock data should be updated to the new format, and then this function can be removed
  public async reformatAndUploadOldGlofasStationData({
    countryCodeISO3,
    date,
    leadTime,
    stationForecasts,
  }: UploadGlofasStationDynamicOldFormatDto) {
    const keys = [
      'forecastLevel',
      'forecastReturnPeriod',
      'triggerLevel',
      'eapAlertClass',
    ];

    for (const key of keys) {
      const uploadDynamicPointDataDto = new UploadDynamicPointDataDto();

      uploadDynamicPointDataDto.key = key;
      uploadDynamicPointDataDto.leadTime = leadTime;
      uploadDynamicPointDataDto.date = date || new Date();
      uploadDynamicPointDataDto.disasterType = DisasterType.Floods;
      uploadDynamicPointDataDto.countryCodeISO3 = countryCodeISO3;
      uploadDynamicPointDataDto.dynamicPointData = stationForecasts.map(
        ({ stationCode: fid, ...rest }) => ({ fid, value: rest[key] }),
      );

      await this.uploadDynamicPointData(uploadDynamicPointDataDto);
    }
  }
}
