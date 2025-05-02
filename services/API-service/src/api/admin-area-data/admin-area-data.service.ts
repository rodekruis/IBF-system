import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import { Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminDataReturnDto } from '../admin-area-dynamic-data/dto/admin-data-return.dto';
import { UpdateableStaticIndicator } from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import {
  UploadAdminAreaDataDto,
  UploadAdminAreaDataJsonDto,
} from './dto/upload-admin-area-data.dto';

@Injectable()
export class AdminAreaDataService {
  private logger = new Logger('AdminAreaDataService');

  @InjectRepository(AdminAreaDataEntity)
  private readonly adminAreaDataRepository: Repository<AdminAreaDataEntity>;

  public constructor(private readonly helperService: HelperService) {}

  public async uploadCsv(data): Promise<void> {
    const objArray = await this.helperService.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(objArray);

    await this.prepareAndUpload(validatedObjArray);
  }

  private groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  public async validateArray(csvArray): Promise<UploadAdminAreaDataDto[]> {
    const validatatedArray = [];
    for (const [_i, row] of csvArray.entries()) {
      const data = new UploadAdminAreaDataDto();
      data.countryCodeISO3 = row.countryCodeISO3;
      data.adminLevel = parseInt(row.adminLevel);
      data.placeCode = row.placeCode;
      data.indicator = row.indicator;
      data.value = row.value ? parseFloat(row.value) : null;
      const result = await validate(data);
      if (result.length > 0) {
        this.logger.log(`Validation error in row ${_i + 1}. Result: ${result}`);
        throw new HttpException(result, HttpStatus.BAD_REQUEST);
      }
      validatatedArray.push(data);
    }
    return validatatedArray;
  }

  public async prepareAndUpload(adminAreaData: UploadAdminAreaDataDto[]) {
    const dataByCountryCodeISO3 = this.groupBy(
      adminAreaData,
      'countryCodeISO3',
    );

    for (const countryCodeISO3 of Object.keys(dataByCountryCodeISO3)) {
      const countryAdminAreaData = dataByCountryCodeISO3[countryCodeISO3];

      const dataByAdminLevel = this.groupBy(countryAdminAreaData, 'adminLevel');

      for (const adminLevel of Object.keys(dataByAdminLevel)) {
        const adminLevelAdminAreaData = dataByAdminLevel[adminLevel];

        const dataByIndicator = this.groupBy(
          adminLevelAdminAreaData,
          'indicator',
        );

        for (const indicator of Object.keys(dataByIndicator)) {
          const indicatorAdminAreaData = dataByIndicator[indicator];

          const dto = new UploadAdminAreaDataJsonDto();
          dto.indicator = indicator as UpdateableStaticIndicator;
          dto.countryCodeISO3 = countryCodeISO3;
          dto.adminLevel = Number(adminLevel);
          dto.dataPlaceCode = indicatorAdminAreaData.map(
            ({ placeCode, value: amount }) => ({ placeCode, amount }),
          );

          await this.uploadJson(dto);
        }
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
      .where({ countryCodeISO3, adminLevel: Number(adminLevel), indicator })
      .select([
        'admin-area-data.value AS value',
        'admin-area-data.placeCode AS "placeCode"',
      ])
      .execute();
    return result;
  }
}
