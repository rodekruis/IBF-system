import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import { Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminDataReturnDto } from '../admin-area-dynamic-data/dto/admin-data-return.dto';
import { StaticIndicator } from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import {
  AdminAreaDataDto,
  AdminAreaDataJsonDto,
} from './dto/admin-area-data.dto';

@Injectable()
export class AdminAreaDataService {
  private logger = new Logger('AdminAreaDataService');

  @InjectRepository(AdminAreaDataEntity)
  private readonly adminAreaDataRepository: Repository<AdminAreaDataEntity>;

  public constructor(private readonly helperService: HelperService) {}

  public async uploadCsv(csvFile: Express.Multer.File) {
    const adminAreaDataCsv =
      await this.helperService.getCsvData<AdminAreaDataDto>(csvFile);

    await this.validate(adminAreaDataCsv);

    await this.prepareAndUpload(adminAreaDataCsv);
  }

  private groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
    return items.reduce(
      (result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      },
      {} as Record<string, T[]>,
    );
  }

  public async validate(adminAreaDataDtos: AdminAreaDataDto[]) {
    for (const [i, adminAreaDataDto] of adminAreaDataDtos.entries()) {
      const validationErrors = await validate(adminAreaDataDto);
      if (validationErrors.length > 0) {
        this.logger.log(
          `Validation error in row ${i + 1}. Result: ${validationErrors}`,
        );
        throw new HttpException(validationErrors, HttpStatus.BAD_REQUEST);
      }
    }
  }

  public async prepareAndUpload(adminAreaDataDtos: AdminAreaDataDto[]) {
    const dataByCountryCodeISO3 = this.groupBy(
      adminAreaDataDtos,
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

          const adminAreaDataJsonDto = new AdminAreaDataJsonDto();
          adminAreaDataJsonDto.indicator = indicator as StaticIndicator; // REFACTOR: use StaticIndicator enum
          adminAreaDataJsonDto.countryCodeISO3 = countryCodeISO3;
          adminAreaDataJsonDto.adminLevel = Number(adminLevel);
          adminAreaDataJsonDto.dataPlaceCode = indicatorAdminAreaData.map(
            ({ placeCode, value: amount }) => ({ placeCode, amount }),
          );

          await this.upload(adminAreaDataJsonDto);
        }
      }
    }
  }

  public async upload({
    indicator,
    adminLevel,
    countryCodeISO3,
    dataPlaceCode,
  }: AdminAreaDataJsonDto) {
    await this.adminAreaDataRepository.delete({
      indicator,
      adminLevel,
      countryCodeISO3,
    });

    const adminAreaData = dataPlaceCode.map(({ placeCode, amount: value }) => {
      const adminAreaDataEntity = new AdminAreaDataEntity();

      adminAreaDataEntity.countryCodeISO3 = countryCodeISO3;
      adminAreaDataEntity.adminLevel = adminLevel;
      adminAreaDataEntity.indicator = indicator;
      adminAreaDataEntity.placeCode = placeCode;
      adminAreaDataEntity.value = value;

      return adminAreaDataEntity;
    });

    this.adminAreaDataRepository.save(adminAreaData);
  }

  public async getAdminAreaData(
    countryCodeISO3: string,
    adminLevel: number,
    indicator: string,
  ): Promise<AdminDataReturnDto[]> {
    return this.adminAreaDataRepository.find({
      select: ['value', 'placeCode'],
      where: { countryCodeISO3, adminLevel, indicator },
    });
  }
}
