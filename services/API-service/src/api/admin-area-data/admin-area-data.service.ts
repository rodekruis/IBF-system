import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import { UploadAdminAreaDataDto } from './dto/upload-admin-area-data.dto';
import { validate } from 'class-validator';
import { AdminDataReturnDto } from '../admin-area-dynamic-data/dto/admin-data-return.dto';
import { HelperService } from '../../shared/helper.service';

@Injectable()
export class AdminAreaDataService {
  @InjectRepository(AdminAreaDataEntity)
  private readonly adminAreaDataRepository: Repository<AdminAreaDataEntity>;

  public constructor(private readonly helperService: HelperService) {}

  public async uploadCsv(data): Promise<void> {
    const objArray = await this.helperService.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(objArray);

    validatedObjArray.forEach(record => {
      this.adminAreaDataRepository.delete({
        placeCode: record['placeCode'],
        indicator: record['indicator'],
      });
    });
    await this.adminAreaDataRepository.save(validatedObjArray);
  }

  public async validateArray(csvArray): Promise<UploadAdminAreaDataDto[]> {
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const data = new UploadAdminAreaDataDto();
      data.countryCodeISO3 = row.countryCodeISO3;
      data.adminLevel = parseInt(row.adminLevel);
      data.placeCode = row.placeCode;
      data.indicator = row.indicator;
      data.value = row.value ? parseFloat(row.value) : null;
      const result = await validate(data);
      if (result.length > 0) {
        console.log('result: ', result);
        throw new HttpException(result, HttpStatus.BAD_REQUEST);
      }
      validatatedArray.push(data);
    }
    return validatatedArray;
  }

  public async uploadJson(
    indicatorData: UploadAdminAreaDataDto[],
  ): Promise<void> {
    await this.deleteExistingEntries(indicatorData);
    const areas = [];
    for (const placeCode of indicatorData) {
      const area = new AdminAreaDataEntity();
      area.indicator = placeCode.indicator;
      area.value = placeCode.value;
      area.adminLevel = placeCode.adminLevel;
      area.placeCode = placeCode.placeCode;
      area.countryCodeISO3 = placeCode.countryCodeISO3;
      areas.push(area);
    }
    this.adminAreaDataRepository.save(areas);
  }

  private async deleteExistingEntries(
    indicatorData: UploadAdminAreaDataDto[],
  ): Promise<void> {
    await this.adminAreaDataRepository.delete({
      indicator: indicatorData[0].indicator,
      adminLevel: indicatorData[0].adminLevel,
      countryCodeISO3: indicatorData[0].countryCodeISO3,
    });
  }

  public async getAdminAreaData(
    countryCodeISO3: string,
    adminLevel: string,
    indicator: string,
  ): Promise<AdminDataReturnDto[]> {
    const result = await this.adminAreaDataRepository
      .createQueryBuilder('admin-area-data')
      .where({
        countryCodeISO3: countryCodeISO3,
        adminLevel: Number(adminLevel),
        indicator: indicator,
      })
      .select([
        'admin-area-data.value AS value',
        'admin-area-data.placeCode AS "placeCode"',
      ])
      .execute();
    return result;
  }
}
