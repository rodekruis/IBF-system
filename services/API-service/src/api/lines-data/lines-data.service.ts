import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { LinesDataEntity, LinesDataEnum } from './lines-data.entity';
import { RoadDto } from './dto/upload-roads.dto';
import { UploadAssetExposureStatusDto } from './dto/upload-asset-exposure-status.dto';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster/disaster-type.enum';
import { BuildingDto } from './dto/upload-buildings.dto';

@Injectable()
export class LinesDataService {
  @InjectRepository(LinesDataEntity)
  private readonly linesDataRepository: Repository<LinesDataEntity>;
  @InjectRepository(LinesDataDynamicStatusEntity)
  private readonly linesDataDynamicStatusRepo: Repository<
    LinesDataDynamicStatusEntity
  >;

  public constructor(private readonly helperService: HelperService) {}

  public async getLinesDataByCountry(
    linesDataCategory: LinesDataEnum,
    countryCodeISO3: string,
    leadTime?: LeadTime,
  ): Promise<GeoJson> {
    const attributes = [];
    const dto = this.getDtoPerLinesDataCategory(linesDataCategory);
    for (const attribute in dto) {
      if (dto.hasOwnProperty(attribute)) {
        attributes.push(attribute);
      }
    }
    const selectColumns = attributes.map(
      attribute => `line.attributes->'${attribute}' AS "${attribute}"`,
    );
    selectColumns.push('geom');
    selectColumns.push('"linesDataId"');

    const linesDataQuery = this.linesDataRepository
      .createQueryBuilder('line')
      .select(selectColumns)
      .where({
        linesDataCategory: linesDataCategory,
        countryCodeISO3: countryCodeISO3,
      });

    if (leadTime) {
      const disasterType = DisasterType.FlashFloods; // TO DO: hard-code for now
      const recentDate = await this.helperService.getRecentDate(
        countryCodeISO3,
        disasterType,
      );
      linesDataQuery
        .leftJoin(
          LinesDataDynamicStatusEntity,
          'status',
          'line."linesDataId" = status."referenceId"',
        )
        .andWhere(
          '(status."leadTime" IS NULL OR status."leadTime" = :leadTime)',
          { leadTime: leadTime },
        )
        .andWhere(
          '(status."timestamp" IS NULL OR status.timestamp >= :cutoffTime)',
          {
            cutoffTime: this.helperService.getUploadCutoffMoment(
              disasterType,
              recentDate.timestamp,
            ),
          },
        )
        .addSelect('COALESCE(status.exposed,FALSE) as "exposed"');
    }
    const linesData = await linesDataQuery.getRawMany();
    return this.helperService.toGeojson(linesData);
  }

  private getDtoPerLinesDataCategory(linesDataCategory: LinesDataEnum): any {
    switch (linesDataCategory) {
      case LinesDataEnum.roads:
        return new RoadDto();
      case LinesDataEnum.buildings:
        return new BuildingDto();
      default:
        throw new HttpException(
          'Not a known lines layer',
          HttpStatus.NOT_FOUND,
        );
    }
  }

  public async uploadJson(
    linesDataCategory: LinesDataEnum,
    countryCodeISO3: string,
    validatedObjArray: any,
    deleteExisting = true,
  ) {
    // Delete existing entries
    if (deleteExisting) {
      await this.linesDataRepository.delete({
        countryCodeISO3: countryCodeISO3,
        linesDataCategory: linesDataCategory,
      });
    }

    const dataArray = validatedObjArray.map(line => {
      const pointAttributes = JSON.parse(JSON.stringify(line)); // hack: clone without referencing
      delete pointAttributes['wkt'];
      return {
        countryCodeISO3: countryCodeISO3,
        referenceId: line.fid || null,
        linesDataCategory: linesDataCategory,
        attributes: JSON.parse(JSON.stringify(pointAttributes)),
        geom: (): string => `ST_GeomFromText('${line.wkt}')`,
      };
    });
    await this.linesDataRepository.save(dataArray, { chunk: 100 });
  }

  public async uploadCsv(
    data,
    linesDataCategory: LinesDataEnum,
    countryCodeISO3: string,
  ): Promise<void> {
    const objArray = await this.helperService.csvBufferToArray(data.buffer);
    const validatedObjArray = await this.validateArray(
      linesDataCategory,
      objArray,
    );

    await this.uploadJson(
      linesDataCategory,
      countryCodeISO3,
      validatedObjArray,
    );
  }

  public async validateArray(
    linesDataCategory: LinesDataEnum,
    csvArray,
  ): Promise<object[]> {
    const errors = [];
    const validatatedArray = [];
    for (const [i, row] of csvArray.entries()) {
      const dto = this.getDtoPerLinesDataCategory(linesDataCategory);
      for (const attribute in dto) {
        if (dto.hasOwnProperty(attribute)) {
          dto[attribute] = row[attribute];
        }
      }
      // TO DO: this validate-step makes the upload super-slow, commented out for now
      // const result = await validate(dto);
      // if (result.length > 0) {
      //   const errorObj = { lineNumber: i + 1, validationError: result };
      //   errors.push(errorObj);
      // }
      validatatedArray.push(dto);
    }
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return validatatedArray;
  }

  public async uploadAssetExposureStatus(
    assetFids: UploadAssetExposureStatusDto,
  ) {
    const assetForecasts: LinesDataDynamicStatusEntity[] = [];
    for (const fid of assetFids.exposedFids) {
      const asset = await this.linesDataRepository.findOne({
        where: {
          referenceId: fid,
          linesDataCategory: assetFids.linesDataCategory,
          countryCodeISO3: assetFids.countryCodeISO3,
        },
      });
      if (!asset) {
        continue;
      }

      // Delete existing entries with same date, leadTime and countryCodeISO3 and stationCode
      await this.linesDataDynamicStatusRepo.delete({
        linesData: asset,
        leadTime: assetFids.leadTime,
        timestamp: MoreThanOrEqual(
          this.helperService.getUploadCutoffMoment(
            assetFids.disasterType,
            assetFids.date || new Date(),
          ),
        ),
      });

      const assetForecast = new LinesDataDynamicStatusEntity();
      assetForecast.linesData = asset;
      assetForecast.leadTime = assetFids.leadTime;
      assetForecast.timestamp = assetFids.date || new Date();
      assetForecast.exposed = true;
      assetForecasts.push(assetForecast);
    }
    await this.linesDataDynamicStatusRepo.save(assetForecasts);
  }
}
