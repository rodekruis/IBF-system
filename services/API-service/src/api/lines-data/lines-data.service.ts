import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, MoreThanOrEqual, Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { UploadLinesExposureStatusDto } from './dto/upload-asset-exposure-status.dto';
import { BuildingDto } from './dto/upload-buildings.dto';
import { RoadDto } from './dto/upload-roads.dto';
import { LinesDataEntity, LinesDataEnum } from './lines-data.entity';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';

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
        { countryCodeISO3, linesDataCategory },
        { active: false },
      );
    }

    const dataArray = validatedObjArray.map((line) => {
      const pointAttributes = JSON.parse(JSON.stringify(line)); // hack: clone without referencing
      delete pointAttributes['wkt'];
      return {
        countryCodeISO3,
        referenceId: line.fid || null,
        linesDataCategory,
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

    const assets = await this.linesDataRepository.find({
      where: {
        referenceId: In(assetFids.exposedFids),
        linesDataCategory: assetFids.linesDataCategory,
        countryCodeISO3: assetFids.countryCodeISO3,
        active: true,
      },
    });

    const linesDataIds = assets.map((asset) => asset.linesDataId);

    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      assetFids.disasterType,
      assetFids.date,
    );

    await this.linesDataDynamicStatusRepo.delete({
      linesData: { linesDataId: In(linesDataIds) },
      leadTime: assetFids.leadTime,
      timestamp: MoreThanOrEqual(uploadCutoffMoment),
    });

    const linesDataDynamicStatuses = assets.map((asset) => {
      const linesDataDynamicStatus = new LinesDataDynamicStatusEntity();
      linesDataDynamicStatus.linesData = asset;
      linesDataDynamicStatus.leadTime = assetFids.leadTime;
      linesDataDynamicStatus.timestamp = assetFids.date;
      linesDataDynamicStatus.exposed = true;
      return linesDataDynamicStatus;
    });

    return this.linesDataDynamicStatusRepo.save(linesDataDynamicStatuses);
  }
}
