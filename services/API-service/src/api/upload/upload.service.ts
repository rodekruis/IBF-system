import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UploadExposureDto } from './dto/upload-exposure.dto';
import fs from 'fs';

@Injectable()
export class UploadService {
  private manager: EntityManager;

  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

  public async exposure(uploadExposure: UploadExposureDto): Promise<void> {
    for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
      const q = `INSERT INTO  "IBF-pipeline-output".calculated_affected( "index", "source", sum, district, "date", country_code, lead_time) 
                VALUES($1, $2, $3, $4, $5, $6, $7)`;
      await this.manager.query(q, [
        1,
        uploadExposure.exposureUnit,
        exposurePlaceCode.amount,
        exposurePlaceCode.placeCode,
        new Date(),
        uploadExposure.countryCodeISO3,
        uploadExposure.leadTime,
      ]);
    }
    await this.processExposure();
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
