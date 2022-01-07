import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { Repository } from 'typeorm';
import { RedcrossBranchEntity } from './redcross-branch.entity';
import {
  RedCrossBranchDto,
  UploadRedCrossBranchCsvDto,
  UploadRedCrossBranchJsonDto,
} from './dto/upload-red-cross-branch.dto';
import { validate } from 'class-validator';
import { Readable } from 'typeorm/platform/PlatformTools';
import csv from 'csv-parser';

@Injectable()
export class RedcrossBranchService {
  @InjectRepository(RedcrossBranchEntity)
  private readonly redcrossBranchRepository: Repository<RedcrossBranchEntity>;

  private readonly helperService: HelperService;

  public constructor(helperService: HelperService) {
    this.helperService = helperService;
  }

  public async getBranchesByCountry(countryCodeISO3): Promise<GeoJson> {
    const branches = await this.redcrossBranchRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
    return this.helperService.toGeojson(branches);
  }

  public async uploadJson(
    uploadRedCrossBranchJson: UploadRedCrossBranchJsonDto,
  ) {
    // Delete existing entries
    await this.redcrossBranchRepository.delete({
      countryCodeISO3: uploadRedCrossBranchJson.countryCodeISO3,
    });

    for await (const branch of uploadRedCrossBranchJson.branchData) {
      this.redcrossBranchRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCodeISO3: uploadRedCrossBranchJson.countryCodeISO3,
          name: branch.branch_name,
          numberOfVolunteers: branch.number_of_volunteers,
          contactPerson: branch.contact_person,
          contactAddress: branch.contact_address,
          contactNumber: branch.contact_number,
          geom: (): string =>
            `st_asgeojson(st_MakePoint(${branch.lon}, ${branch.lat}))::json`,
        })
        .execute();
    }
  }

  public async uploadCsv(data, countryCodeISO3: string): Promise<void> {
    const objArray = await this.csvBufferToArray(data.buffer);
    const validatedObjArray = (await this.validateArray(
      objArray,
    )) as RedCrossBranchDto[];

    const uploadRedCrossBranchJson: UploadRedCrossBranchJsonDto = {
      countryCodeISO3,
      branchData: validatedObjArray,
    };

    await this.uploadJson(uploadRedCrossBranchJson);
  }

  public async csvBufferToArray(buffer): Promise<object[]> {
    const stream = new Readable();
    stream.push(buffer.toString());
    stream.push(null);
    const parsedData = [];
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
    console.log('csvArray: ', csvArray);
    const errors = [];
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const data = new UploadRedCrossBranchCsvDto();
      data.branch_name = row.branch_name;
      data.lat = row.lat;
      data.lon = row.lon;
      data.contact_address = row.contact_address;
      data.contact_number = row.contact_number;
      data.contact_person = row.contact_person;
      data.number_of_volunteers = row.number_of_volunteers;
      console.log('data: ', data);
      const result = await validate(data);
      console.log('result: ', result);
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
}
