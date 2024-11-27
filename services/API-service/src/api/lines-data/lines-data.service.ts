import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MoreThanOrEqual, Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { UploadLinesExposureStatusDto } from './dto/upload-asset-exposure-status.dto';
import { BuildingDto } from './dto/upload-buildings.dto';
import { RoadDto } from './dto/upload-roads.dto';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';
import { LinesDataEntity, LinesDataEnum } from './lines-data.entity';

@Injectable()
export class LinesDataService {
  @InjectRepository(LinesDataEntity)
  private readonly linesDataRepository: Repository<LinesDataEntity>;
  @InjectRepository(LinesDataDynamicStatusEntity)
  private readonly linesDataDynamicStatusRepo: Repository<LinesDataDynamicStatusEntity>;

  public constructor(private readonly helperService: HelperService) {}

  private getDtoPerLinesDataCategory(linesDataCategory: LinesDataEnum) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validatedObjArray: any,
    deactivateExisting = true,
  ) {
    // Delete existing entries
    if (deactivateExisting) {
      await this.linesDataRepository.update(
        {
          countryCodeISO3: countryCodeISO3,
          linesDataCategory: linesDataCategory,
        },
        { active: false },
      );
    }

    const dataArray = validatedObjArray.map((line) => {
      const pointAttributes = JSON.parse(JSON.stringify(line)); // hack: clone without referencing
      delete pointAttributes['wkt'];
      return {
        countryCodeISO3: countryCodeISO3,
        referenceId: line.fid || null,
        linesDataCategory: linesDataCategory,
        attributes: JSON.parse(JSON.stringify(pointAttributes)),
        active: true,
        geom: (): string => `st_geomfromtext(
          'GEOMETRYCOLLECTION(${line.wkt})')`,
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
    for (const [_i, row] of csvArray.entries()) {
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
    assetFids: UploadLinesExposureStatusDto,
  ) {
    // Make sure all assets within one upload have the same timestamp, to make sure the asset exposure views work correctly
    assetFids.date = assetFids.date || new Date();
    const assetForecasts: LinesDataDynamicStatusEntity[] = [];
    for (const fid of assetFids.exposedFids) {
      const asset = await this.linesDataRepository.findOne({
        where: {
          referenceId: Number(fid),
          linesDataCategory: assetFids.linesDataCategory,
          countryCodeISO3: assetFids.countryCodeISO3,
        },
      });
      if (!asset) {
        continue;
      }

      // Delete existing entries with same date, leadTime and countryCodeISO3 and stationCode
      await this.linesDataDynamicStatusRepo.delete({
        linesData: { linesDataId: asset.linesDataId },
        leadTime: assetFids.leadTime,
        timestamp: MoreThanOrEqual(
          this.helperService.getUploadCutoffMoment(
            assetFids.disasterType,
            assetFids.date,
          ),
        ),
      });

      const assetForecast = new LinesDataDynamicStatusEntity();
      assetForecast.linesData = asset;
      assetForecast.leadTime = assetFids.leadTime;
      assetForecast.timestamp = assetFids.date;
      assetForecast.exposed = true;
      assetForecasts.push(assetForecast);
    }
    await this.linesDataDynamicStatusRepo.save(assetForecasts);
  }
}
