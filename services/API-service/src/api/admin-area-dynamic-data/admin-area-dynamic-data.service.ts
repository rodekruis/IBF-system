import { CountryService } from './../country/country.service';
import { LeadTime, LeadTimeDayMonth } from './enum/lead-time.enum';
import { DynamicDataPlaceCodeDto } from './dto/dynamic-data-place-code.dto';
import { Injectable } from '@nestjs/common';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { DynamicIndicator } from './enum/dynamic-data-unit';
import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { UploadTriggerPerLeadTimeDto } from '../event/dto/upload-trigger-per-leadtime.dto';
import { EventService } from '../event/event.service';
import { DisasterEntity } from '../disaster/disaster.entity';
import { DisasterType } from '../disaster/disaster-type.enum';

@Injectable()
export class AdminAreaDynamicDataService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<
    AdminAreaDynamicDataEntity
  >;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;

  private eventService: EventService;

  public constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  public async exposure(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    // Delete existing entries with same date, leadtime and countryCodeISO3 and unit type
    await this.deleteDynamicDuplicates(uploadExposure);

    console.time('Insert exposure');
    const areas = [];
    for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
      const area = new AdminAreaDynamicDataEntity();
      area.indicator = uploadExposure.dynamicIndicator;
      area.value = exposurePlaceCode.amount;
      area.adminLevel = uploadExposure.adminLevel;
      area.placeCode = exposurePlaceCode.placeCode;
      area.date = new Date();
      area.countryCodeISO3 = uploadExposure.countryCodeISO3;
      area.leadTime = uploadExposure.leadTime;
      area.disasterType = uploadExposure.disasterType;
      areas.push(area);
    }
    await this.adminAreaDynamicDataRepo.save(areas);
    console.timeEnd('Insert exposure');

    console.time('Process trigger');

    const triggerUnit = await this.disasterTypeRepository.findOne({
      select: ['triggerUnit'],
      where: { disasterType: uploadExposure.disasterType },
    });

    if (triggerUnit.triggerUnit === uploadExposure.dynamicIndicator) {
      await this.insertTrigger(uploadExposure);

      await this.eventService.processEventAreas(
        uploadExposure.countryCodeISO3,
        uploadExposure.disasterType,
      );
    }

    console.timeEnd('Process trigger');
  }

  private async deleteDynamicDuplicates(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    if (uploadExposure.leadTime.includes(LeadTimeDayMonth.month)) {
      const date = new Date();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      await this.adminAreaDynamicDataRepo.delete({
        indicator: uploadExposure.dynamicIndicator,
        countryCodeISO3: uploadExposure.countryCodeISO3,
        leadTime: uploadExposure.leadTime,
        disasterType: uploadExposure.disasterType,
        date: MoreThanOrEqual(firstDayOfMonth),
      });
    } else {
      await this.adminAreaDynamicDataRepo.delete({
        indicator: uploadExposure.dynamicIndicator,
        countryCodeISO3: uploadExposure.countryCodeISO3,
        leadTime: uploadExposure.leadTime,
        disasterType: uploadExposure.disasterType,
        date: new Date(),
      });
    }
  }

  private async insertTrigger(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    const trigger = this.isThereTrigger(uploadExposure.exposurePlaceCodes);

    const uploadTriggerPerLeadTimeDto = new UploadTriggerPerLeadTimeDto();
    uploadTriggerPerLeadTimeDto.countryCodeISO3 =
      uploadExposure.countryCodeISO3;
    uploadTriggerPerLeadTimeDto.disasterType = uploadExposure.disasterType;
    uploadTriggerPerLeadTimeDto.triggersPerLeadTime = [
      {
        leadTime: uploadExposure.leadTime as LeadTime,
        triggered: trigger,
      },
    ];
    await this.eventService.uploadTriggerPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }

  private isThereTrigger(
    exposurePlaceCodes: DynamicDataPlaceCodeDto[],
  ): boolean {
    for (const exposurePlaceCode of exposurePlaceCodes) {
      if (Number(exposurePlaceCode.amount) > 0) {
        return true;
      }
    }
    return false;
  }

  public async getAdminAreaDynamicData(
    countryCodeISO3: string,
    adminLevel: string,
    leadTime: LeadTime,
    indicator: DynamicIndicator,
    disasterType: DisasterType,
  ): Promise<AdminDataReturnDto[]> {
    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .where({
        countryCodeISO3: countryCodeISO3,
        adminLevel: Number(adminLevel),
        leadTime: leadTime,
        indicator: indicator,
        disasterType: disasterType,
      })
      .select(['dynamic.value AS value', 'dynamic.placeCode AS "placeCode"'])
      .orderBy('dynamic.date', 'DESC')
      .execute();
    return result;
  }

  public async getDynamicAdminAreaDataPerPcode(
    indicator: DynamicIndicator,
    placeCode: string,
    leadTime: string,
  ): Promise<number> {
    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .where({
        indicator: indicator,
        placeCode: placeCode,
        leadTime: leadTime,
      })
      .select(['dynamic.value AS value'])
      .orderBy('dynamic.date', 'DESC')
      .execute();
    return result[0].value;
  }
}
