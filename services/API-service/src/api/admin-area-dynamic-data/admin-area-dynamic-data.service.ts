import { LeadTime } from './enum/lead-time.enum';
import { ExposurePlaceCodeDto } from './dto/exposure-place-code.dto';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { CalculatedAffectedEntity } from './calculated-affected.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { ExposureUnit } from './enum/exposure-unit';
import { AdminDataReturnDto } from './dto/admin-data-return.dto';

@Injectable()
export class AdminAreaDynamicDataService {
  @InjectRepository(CalculatedAffectedEntity)
  private readonly calculatedAffectedRepository: Repository<
    CalculatedAffectedEntity
  >;
  @InjectRepository(TriggerPerLeadTime)
  private readonly triggerPerLeadTimeRepository: Repository<TriggerPerLeadTime>;

  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<
    AdminAreaDynamicDataEntity
  >;
  private manager: EntityManager;

  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

  public async exposure(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    // Delete existsing entries with same date, leadtime and country_code and unit typ
    await this.calculatedAffectedRepository.delete({
      source: uploadExposure.exposureUnit,
      date: new Date(),
      countryCode: uploadExposure.countryCodeISO3,
      leadTime: uploadExposure.leadTime,
    });
    if (uploadExposure.exposureUnit === 'population') {
      for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
        const calculatedAffected = new CalculatedAffectedEntity();
        calculatedAffected.source = uploadExposure.exposureUnit;
        calculatedAffected.sum = String(exposurePlaceCode.amount);
        calculatedAffected.district = exposurePlaceCode.placeCode;
        calculatedAffected.date = new Date();
        calculatedAffected.countryCode = uploadExposure.countryCodeISO3;
        calculatedAffected.leadTime = uploadExposure.leadTime;
        this.calculatedAffectedRepository.save(calculatedAffected);
        await this.insertTrigger(uploadExposure);
      }
    } else {
      await this.adminAreaDynamicDataRepo.delete({
        key: uploadExposure.exposureUnit,
        date: new Date(),
        countryCode: uploadExposure.countryCodeISO3,
        leadTime: uploadExposure.leadTime,
      });
      for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
        const area = new AdminAreaDynamicDataEntity();
        area.key = uploadExposure.exposureUnit;
        area.value = exposurePlaceCode.amount;
        area.adminLevel = uploadExposure.adminLevel;
        area.placeCode = exposurePlaceCode.placeCode;
        area.date = new Date();
        area.countryCode = uploadExposure.countryCodeISO3;
        area.leadTime = uploadExposure.leadTime;
        this.adminAreaDynamicDataRepo.save(area);
      }
    }
    await this.processExposure();
  }

  private async insertTrigger(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    const trigger = this.isThereTrigger(uploadExposure.exposurePlaceCodes);
    // Delete duplicates
    await this.triggerPerLeadTimeRepository.delete({
      date: new Date(),
      countryCode: uploadExposure.countryCodeISO3,
      leadTime: uploadExposure.leadTime as LeadTime,
    });
    const triggerPerLeadTime = new TriggerPerLeadTime();
    triggerPerLeadTime.date = new Date();
    triggerPerLeadTime.countryCode = uploadExposure.countryCodeISO3;
    triggerPerLeadTime.leadTime = uploadExposure.leadTime as LeadTime;
    triggerPerLeadTime.triggered = trigger;
    await this.triggerPerLeadTimeRepository.save(triggerPerLeadTime);
  }

  private isThereTrigger(exposurePlaceCodes: ExposurePlaceCodeDto[]): boolean {
    for (const exposurePlaceCode of exposurePlaceCodes) {
      if (Number(exposurePlaceCode.amount) > 0) {
        return true;
      }
    }
    return false;
  }

  public async processExposure(): Promise<void> {
    const sqlFolder = '../../ibf/pipeline/';
    const sqlFileNames = [
      'processDynamicDataPostgresTrigger.sql',
      'processDynamicDataPostgresExposure.sql',
      'processEventDistricts.sql',
    ];

    for (const sqlFileName of sqlFileNames) {
      const sqlPath = sqlFolder + sqlFileName;
      const q = fs.readFileSync(sqlPath).toString();
      await this.manager.query(q);
    }
  }

  public async getAdminAreaDynamicData(
    countryCode: string,
    adminLevel: string,
    leadTime: LeadTime,
    key: ExposureUnit,
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
