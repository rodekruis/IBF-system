import { GeoJson } from './../../models/geo.model';
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { validate } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UgaDataLevel2Dto } from './uga-data-level-2.dto';
import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Readable } from 'stream';
import { UgaDataLevel2Entity } from './uga-data-level-2.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import fs from 'fs';
const csv = require('csv-parser');

@Injectable()
export class UgaDataLevel2Service {
  @InjectRepository(UgaDataLevel2Entity)
  private readonly ugaLevel2Repo: Repository<UgaDataLevel2Entity>;

  public constructor() {}

  public async updateOrCreate(data): Promise<void> {
    const objArray = await this.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(objArray);
    await this.ugaLevel2Repo.save(validatedObjArray);
  }

  public async csvBufferToArray(buffer): Promise<object[]> {
    const stream = new Readable();
    stream.push(buffer.toString());
    stream.push(null);
    let parsedData = [];
    return await new Promise(function(resolve, reject) {
      stream
        .pipe(csv({ delimiter: ';' }))
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
      let ugaData = new UgaDataLevel2Dto();
      ugaData.pcode = row.pcode;
      ugaData.covidrisk = parseFloat(row.covidrisk);
      const result = await validate(ugaData);
      if (result.length > 0) {
        const errorObj = { lineNunber: i + 1, validationError: result };
        errors.push(errorObj);
      }
      validatatedArray.push(ugaData);
    }
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return validatatedArray;
  }

  public async findAll(): Promise<GeoJson> {
    const entityManager = getManager();
    const q = fs
      .readFileSync('./src/api/uga-data-level-2/sql/select-all-uga-level-2.sql')
      .toString();
    return await entityManager.query(q);
  }
}
