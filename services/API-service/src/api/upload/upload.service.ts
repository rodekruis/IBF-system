import { LeadTime } from './enum/lead-time.enum';
import { ExposurePlaceCodeDto } from './dto/exposure-place-code.dto';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UploadExposureDto } from './dto/upload-exposure.dto';
import fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { CalculatedAffectedEntity } from './calculated-affected.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';

@Injectable()
export class UploadService {
    @InjectRepository(CalculatedAffectedEntity)
    private readonly calculatedAffectedRepository: Repository<
        CalculatedAffectedEntity
    >;
    @InjectRepository(TriggerPerLeadTime)
    private readonly triggerPerLeadTimeRepository: Repository<
        TriggerPerLeadTime
    >;
    private manager: EntityManager;

    public constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async exposure(uploadExposure: UploadExposureDto): Promise<void> {
        // Delete existsing entries with same date, leadtime and country_code and unit typ
        await this.calculatedAffectedRepository.delete({
            source: uploadExposure.exposureUnit,
            date: new Date(),
            countryCode: uploadExposure.countryCodeISO3,
            leadTime: uploadExposure.leadTime,
        });

        for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
            const calculatedAffected = new CalculatedAffectedEntity();
            calculatedAffected.source = uploadExposure.exposureUnit;
            calculatedAffected.sum = exposurePlaceCode.amount;
            calculatedAffected.district = exposurePlaceCode.placeCode;
            calculatedAffected.date = new Date();
            calculatedAffected.countryCode = uploadExposure.countryCodeISO3;
            calculatedAffected.leadTime = uploadExposure.leadTime;
            this.calculatedAffectedRepository.save(calculatedAffected);
        }
        await this.processExposure();
        await this.insertTrigger(uploadExposure);
    }

    private async insertTrigger(
        uploadExposure: UploadExposureDto,
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

    private isThereTrigger(
        exposurePlaceCodes: ExposurePlaceCodeDto[],
    ): boolean {
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
}
