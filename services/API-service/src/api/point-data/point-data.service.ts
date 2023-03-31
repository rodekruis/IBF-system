import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { Repository } from 'typeorm';
import { EvacuationCenterDto } from './dto/upload-evacuation-centers.dto';
import { PointDataEntity, PointDataEnum } from './point-data.entity';
import { DamSiteDto } from './dto/upload-dam-sites.dto';
import { HealthSiteDto } from './dto/upload-health-sites.dto';
import { RedCrossBranchDto } from './dto/upload-red-cross-branch.dto';
import { CommunityNotificationDto } from './dto/upload-community-notifications.dto';
import { WhatsappService } from '../notification/whatsapp/whatsapp.service';

@Injectable()
export class PointDataService {
  @InjectRepository(PointDataEntity)
  private readonly pointDataRepository: Repository<PointDataEntity>;

  public constructor(
    private readonly helperService: HelperService,
    private readonly whatsappService: WhatsappService,
  ) {}

  public async getPointDataByCountry(
    pointDataCategory: PointDataEnum,
    countryCodeISO3: string,
  ): Promise<GeoJson> {
    const attributes = [];
    const dto = this.getDtoPerPointDataCategory(pointDataCategory);
    for (const attribute in dto) {
      if (dto.hasOwnProperty(attribute)) {
        attributes.push(attribute);
      }
    }
    const selectColumns = attributes.map(
      attribute => `point.attributes->'${attribute}' AS "${attribute}"`,
    );
    selectColumns.push('geom');
    selectColumns.push('"pointDataId"');

    const pointData = await this.pointDataRepository
      .createQueryBuilder('point')
      .select(selectColumns)
      .where({
        pointDataCategory: pointDataCategory,
        countryCodeISO3: countryCodeISO3,
      })
      .getRawMany();
    return this.helperService.toGeojson(pointData);
  }

  private getDtoPerPointDataCategory(pointDataCategory: PointDataEnum): any {
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

    const dataArray = validatedObjArray.map(point => {
      const pointAttributes = JSON.parse(JSON.stringify(point)); // hack: clone without referencing
      delete pointAttributes['lat'];
      delete pointAttributes['lon'];
      return {
        countryCodeISO3: countryCodeISO3,
        pointDataCategory: pointDataCategory,
        attributes: JSON.parse(JSON.stringify(pointAttributes)),
        geom: (): string =>
          `st_asgeojson(st_MakePoint(${point.lon}, ${point.lat}))::json`,
      };
    });
    await this.pointDataRepository.save(dataArray);
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
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const attributes = [];
      const dto = this.getDtoPerPointDataCategory(pointDataCategory);
      for (const attribute in dto) {
        if (dto.hasOwnProperty(attribute)) {
          attributes.push(attribute);
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
      validatatedArray.push(dto);
    }
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return validatatedArray;
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
    communityNotification: any,
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
}
