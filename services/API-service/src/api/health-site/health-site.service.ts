import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HelperService } from '../../shared/helper.service';
import { getManager, Repository } from 'typeorm';
import { HealthSiteEntity } from './health-site.entity';
import {
  HealthSiteDto,
  UploadHealthSiteCsvDto,
  UploadHealthSiteJsonDto,
} from './dto/upload-health-sites.dto';
import { validate } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HealthSiteService {
  @InjectRepository(HealthSiteEntity)
  private readonly healthSiteRepository: Repository<HealthSiteEntity>;

  public constructor(private readonly helperService: HelperService) {}

  public async getHealthSitesCountry(countryCodeISO3: string): Promise<any> {
    const queryResult = await getManager()
      .createQueryBuilder()
      // convert geometry result into GeoJSON, treated as JSON (so that TypeORM
      // will know to deserialize it)
      .select('name, type, ST_AsGeoJSON(geom)::json geom')
      .from(HealthSiteEntity, 'healthSiteEntity')
      .where('healthSiteEntity.countryCodeISO3 = :countryCodeISO3', {
        countryCodeISO3,
      })
      .getRawMany();

    return this.helperService.toGeojson(queryResult);
  }

  public async uploadJson(uploadHealthSiteJsonDto: UploadHealthSiteJsonDto) {
    // Delete existing entries
    await this.healthSiteRepository.delete({
      countryCodeISO3: uploadHealthSiteJsonDto.countryCodeISO3,
    });

    for await (const branch of uploadHealthSiteJsonDto.healthSitesData) {
      this.healthSiteRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCodeISO3: uploadHealthSiteJsonDto.countryCodeISO3,
          name: branch.name,
          type: branch.type,
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
    )) as HealthSiteDto[];

    const uploadHealthSiteJsonDto: UploadHealthSiteJsonDto = {
      countryCodeISO3,
      healthSitesData: validatedObjArray,
    };

    await this.uploadJson(uploadHealthSiteJsonDto);
  }

  public async validateArray(csvArray): Promise<object[]> {
    const errors = [];
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const data = new UploadHealthSiteCsvDto();
      data.name = row.name;
      data.type = row.type;
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
