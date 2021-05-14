import { LeadTime } from './enum/lead-time.enum';
import { DynamicDataPlaceCodeDto } from './dto/dynamic-data-place-code.dto';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { DynamicDataUnit } from './enum/dynamic-data-unit';
import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { UploadTriggerPerLeadTimeDto } from '../event/dto/upload-trigger-per-leadtime.dto';
import { EventService } from '../event/event.service';

@Injectable()
export class AdminAreaDynamicDataService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<
    AdminAreaDynamicDataEntity
  >;
  private eventService: EventService;

  public constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  public async exposure(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    // Delete existing entries with same date, leadtime and country_code and unit typ
    await this.adminAreaDynamicDataRepo.delete({
      key: uploadExposure.dynamicDataUnit,
      date: new Date(),
      countryCode: uploadExposure.countryCodeISO3,
      leadTime: uploadExposure.leadTime,
    });
    if (uploadExposure.dynamicDataUnit === DynamicDataUnit.population) {
      for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
        const dynamicDataRecord = new AdminAreaDynamicDataEntity();
        dynamicDataRecord.countryCode = uploadExposure.countryCodeISO3;
        dynamicDataRecord.adminLevel = 2;
        dynamicDataRecord.placeCode = exposurePlaceCode.placeCode;
        dynamicDataRecord.key = uploadExposure.dynamicDataUnit;
        dynamicDataRecord.date = new Date();
        dynamicDataRecord.value = exposurePlaceCode.amount;
        dynamicDataRecord.leadTime = uploadExposure.leadTime;
        this.adminAreaDynamicDataRepo.save(dynamicDataRecord);
        await this.insertTrigger(uploadExposure);
      }
    } else {
      await this.adminAreaDynamicDataRepo.delete({
        key: uploadExposure.dynamicDataUnit,
        date: new Date(),
        countryCode: uploadExposure.countryCodeISO3,
        leadTime: uploadExposure.leadTime,
      });
      for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
        const area = new AdminAreaDynamicDataEntity();
        area.key = uploadExposure.dynamicDataUnit;
        area.value = exposurePlaceCode.amount;
        area.adminLevel = uploadExposure.adminLevel;
        area.placeCode = exposurePlaceCode.placeCode;
        area.date = new Date();
        area.countryCode = uploadExposure.countryCodeISO3;
        area.leadTime = uploadExposure.leadTime;
        this.adminAreaDynamicDataRepo.save(area);
      }
    }
    await this.eventService.processEventAreas();
  }

  private async insertTrigger(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    const trigger = this.isThereTrigger(uploadExposure.exposurePlaceCodes);

    const uploadTriggerPerLeadTimeDto = new UploadTriggerPerLeadTimeDto();
    uploadTriggerPerLeadTimeDto.countryCode = uploadExposure.countryCodeISO3;
    uploadTriggerPerLeadTimeDto.leadTime = uploadExposure.leadTime as LeadTime;
    uploadTriggerPerLeadTimeDto.triggered = trigger;
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
    countryCode: string,
    adminLevel: string,
    leadTime: LeadTime,
    key: DynamicDataUnit,
  ): Promise<AdminDataReturnDto[]> {
    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('admin_area_dynamic_data')
      .where({
        countryCode: countryCode,
        adminLevel: Number(adminLevel),
        leadTime: leadTime,
        key: key,
      })
      .select([
        'admin_area_dynamic_data.value AS value',
        'admin_area_dynamic_data.placeCode AS "placeCode"',
      ])
      .execute();
    return result;
  }
}
