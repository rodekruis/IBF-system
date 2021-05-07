import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import csv from 'csv-parser';
import { UploadAdminAreaDataDto } from './dto/upload-admin-area-data.dto';
import { validate } from 'class-validator';
import { AdminDataReturnDto } from '../admin-area-dynamic-data/dto/admin-data-return.dto';
import { ExposureUnit } from '../admin-area-dynamic-data/enum/exposure-unit';

@Injectable()
export class AdminAreaDataService {
  @InjectRepository(AdminAreaDataEntity)
  private readonly adminAreaDataRepository: Repository<AdminAreaDataEntity>;

  public constructor() {}

  public async updateOrCreate(data): Promise<void> {
    const objArray = await this.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(objArray);

    validatedObjArray.forEach(record => {
      this.adminAreaDataRepository.delete({
        placeCode: record['placeCode'],
        key: record['key'],
      });
    });
    await this.adminAreaDataRepository.save(validatedObjArray);
  }

  public async csvBufferToArray(buffer): Promise<object[]> {
    const stream = new Readable();
    stream.push(buffer.toString());
    stream.push(null);
    let parsedData = [];
    return await new Promise(function(resolve, reject) {
      stream
        .pipe(csv())
        .on('error', error => reject(error))
        .on('data', row => parsedData.push(row))
        .on('end', () => {
          resolve(parsedData);
        });
    });
  }

  public async validateArray(csvArray): Promise<object[]> {
    const errors = [];
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      let data = new UploadAdminAreaDataDto();
      data.countryCode = row.countryCode;
      data.adminLevel = parseInt(row.adminLevel);
      data.placeCode = row.placeCode;
      data.key = row.key;
      data.value = parseFloat(row.value);
      const result = await validate(data);
      if (result.length > 0) {
        const errorObj = { lineNunber: i + 1, validationError: result };
        errors.push(errorObj);
      }
      validatatedArray.push(data);
    }
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return validatatedArray;
  }

  public async getAdminAreaData(
    countryCode: string,
    adminLevel: string,
    key: ExposureUnit,
  ): Promise<AdminDataReturnDto[]> {
    const result = await this.adminAreaDataRepository
      .createQueryBuilder('adminAreaData')
      .where({
        countryCode: countryCode,
        adminLevel: Number(adminLevel),
        key: key,
      })
      .select([
        'adminAreaData.value AS value',
        'adminAreaData.placeCode AS "placeCode"',
      ])
      .execute();
    return result;
  }
}
