import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { Repository } from 'typeorm';
import {
  EvacuationCenterDto,
  UploadEvacuationCenterCsvDto,
  UploadEvacuationCenterJsonDto,
} from './dto/upload-evacuation-centers.dto';
import { EvacuationCenterEntity } from './evacuation-center.entity';

@Injectable()
export class EvacuationCenterService {
  @InjectRepository(EvacuationCenterEntity)
  private readonly evacuationCenterRepository: Repository<
    EvacuationCenterEntity
  >;

  public constructor(private readonly helperService: HelperService) {}

  public async getEvacuationCentersByCountry(
    countryCodeISO3,
  ): Promise<GeoJson> {
    const evacuationCenters = await this.evacuationCenterRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
    return this.helperService.toGeojson(evacuationCenters);
  }

  public async uploadJson(
    uploadEvacuationCenterCsvDto: UploadEvacuationCenterJsonDto,
  ) {
    // Delete existing entries
    await this.evacuationCenterRepository.delete({
      countryCodeISO3: uploadEvacuationCenterCsvDto.countryCodeISO3,
    });

    for await (const branch of uploadEvacuationCenterCsvDto.evacuationCenterData) {
      this.evacuationCenterRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCodeISO3: uploadEvacuationCenterCsvDto.countryCodeISO3,
          evacuationCenterName: branch.evacuationCenterName,
          geom: (): string =>
            `st_asgeojson(st_MakePoint(${branch.lon}, ${branch.lat}))::json`,
        })
        .execute();
    }
  }

  public async uploadCsv(data, countryCodeISO3: string): Promise<void> {
    const objArray = await this.helperService.csvBufferToArray(data.buffer);
    const validatedObjArray = (await this.validateArray(
      objArray,
    )) as EvacuationCenterDto[];

    const uploadEvacuationCenterJsonDto: UploadEvacuationCenterJsonDto = {
      countryCodeISO3,
      evacuationCenterData: validatedObjArray,
    };

    await this.uploadJson(uploadEvacuationCenterJsonDto);
  }

  public async validateArray(csvArray): Promise<object[]> {
    const errors = [];
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const data = new UploadEvacuationCenterCsvDto();
      data.evacuationCenterName = row.evacuationCenterName;
      data.lat = row.lat;
      data.lon = row.lon;
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
}
