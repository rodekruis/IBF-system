import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import {
  UploadAdminAreaDataDto,
  UploadAdminAreaDataJsonDto,
} from './dto/upload-admin-area-data.dto';
import { validate } from 'class-validator';
import { AdminDataReturnDto } from '../admin-area-dynamic-data/dto/admin-data-return.dto';
import { HelperService } from '../../shared/helper.service';
import { UpdateableStaticIndicator } from '../admin-area-dynamic-data/enum/dynamic-data-unit';

@Injectable()
export class AdminAreaDataService {
  @InjectRepository(AdminAreaDataEntity)
  private readonly adminAreaDataRepository: Repository<AdminAreaDataEntity>;

  public constructor(private readonly helperService: HelperService) {}

  public async uploadCsv(data): Promise<void> {
    const objArray = await this.helperService.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(objArray);

    await this.prepareAndUpload(validatedObjArray);
  }

  private groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

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

  public async prepareAndUpload(validatedArray: UploadAdminAreaDataDto[]) {
    for (const adminLevel of [1, 2, 3, 4]) {
      const fileredByAdminLevel = validatedArray.filter(
        r => r.adminLevel === adminLevel,
      );
      if (fileredByAdminLevel.length === 0) {
        continue;
      }
      const dataByIndicator = this.groupBy(fileredByAdminLevel, 'indicator');
      for (const indicator of Object.keys(dataByIndicator)) {
        const dto = new UploadAdminAreaDataJsonDto();
        dto.indicator = indicator as UpdateableStaticIndicator;
        dto.countryCodeISO3 = dataByIndicator[indicator][0].countryCodeISO3;
        dto.adminLevel = dataByIndicator[indicator][0].adminLevel;
        dto.dataPlaceCode = dataByIndicator[indicator].map(record => {
          return { placeCode: record.placeCode, amount: record.value };
        });
        await this.uploadJson(dto);
      }
    }
  }

  public async uploadJson(
    indicatorData: UploadAdminAreaDataJsonDto,
  ): Promise<void> {
    await this.deleteExistingEntries(indicatorData);
    const areas = [];
    for (const placeCode of indicatorData.dataPlaceCode) {
      const area = new AdminAreaDataEntity();
      area.indicator = indicatorData.indicator;
      area.value = placeCode.amount;
      area.adminLevel = indicatorData.adminLevel;
      area.placeCode = placeCode.placeCode;
      area.countryCodeISO3 = indicatorData.countryCodeISO3;
      areas.push(area);
    }
    this.adminAreaDataRepository.save(areas);
  }

  private async deleteExistingEntries(
    indicatorData: UploadAdminAreaDataJsonDto,
  ): Promise<void> {
    await this.adminAreaDataRepository.delete({
      indicator: indicatorData.indicator,
      adminLevel: indicatorData.adminLevel,
      countryCodeISO3: indicatorData.countryCodeISO3,
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
