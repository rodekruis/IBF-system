import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DamSiteEntity } from './dam-site.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { validate } from 'class-validator';
import {
  DamSiteDto,
  UploadDamSiteCsvDto,
  UploadDamSiteJsonDto,
} from './dto/upload-dam-sites.dto';

@Injectable()
export class DamSiteService {
  @InjectRepository(DamSiteEntity)
  private readonly damSiteRepository: Repository<DamSiteEntity>;

  public constructor(private readonly helperService: HelperService) {}

  public async getDamSitesByCountry(countryCodeISO3): Promise<GeoJson> {
    const damSites = await this.damSiteRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
    return this.helperService.toGeojson(damSites);
  }

  public async uploadJson(uploadDamSiteJsonDto: UploadDamSiteJsonDto) {
    // Delete existing entries
    await this.damSiteRepository.delete({
      countryCodeISO3: uploadDamSiteJsonDto.countryCodeISO3,
    });

    for await (const branch of uploadDamSiteJsonDto.damSitesData) {
      this.damSiteRepository
        .createQueryBuilder()
        .insert()
        .values({
          countryCodeISO3: uploadDamSiteJsonDto.countryCodeISO3,
          damName: branch.damName,
          fullSupply: branch.fullSupplyCapacity,
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
    )) as DamSiteDto[];

    const uploadDamSiteJsonDto: UploadDamSiteJsonDto = {
      countryCodeISO3,
      damSitesData: validatedObjArray,
    };

    await this.uploadJson(uploadDamSiteJsonDto);
  }

  public async validateArray(csvArray): Promise<object[]> {
    const errors = [];
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const data = new UploadDamSiteCsvDto();
      data.damName = row.damName;
      data.fullSupplyCapacity = row.fullSupplyCapacity;
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
