import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { UploadLinesExposureStatusDto } from './dto/upload-asset-exposure-status.dto';
import { BuildingDto } from './dto/upload-buildings.dto';
import { RoadDto } from './dto/upload-roads.dto';
import { LinesDataCategory, LinesDataEntity } from './lines-data.entity';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';

export interface LinesDto extends RoadDto, BuildingDto {}

@Injectable()
export class LinesDataService {
  @InjectRepository(LinesDataEntity)
  private readonly linesDataRepository: Repository<LinesDataEntity>;
  @InjectRepository(LinesDataDynamicStatusEntity)
  private readonly linesDataDynamicStatusRepo: Repository<LinesDataDynamicStatusEntity>;

  public constructor(private readonly helperService: HelperService) {}

  private getLinesDto(linesDataCategory: LinesDataCategory) {
    switch (linesDataCategory) {
      case LinesDataCategory.roads:
        return new RoadDto();
      case LinesDataCategory.buildings:
        return new BuildingDto();
      default:
        throw new HttpException(
          'Not a known lines layer',
          HttpStatus.NOT_FOUND,
        );
    }
  }

  public async uploadJson(
    linesDataCategory: LinesDataCategory,
    countryCodeISO3: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linesDtos: any, // REFACTOR: LinesDto[],
    deactivateExisting = true,
  ) {
    // Delete existing entries
    if (deactivateExisting) {
      await this.linesDataRepository.update(
        { countryCodeISO3, linesDataCategory },
        { active: false },
      );
    }

    const linesDataEntities = linesDtos.map((linesDto: LinesDto) => {
      const linesAttributes = JSON.parse(JSON.stringify(linesDto));
      delete linesAttributes['wkt'];

      return {
        countryCodeISO3,
        referenceId: linesDto.fid || null,
        linesDataCategory,
        attributes: JSON.parse(JSON.stringify(linesAttributes)),
        active: true,
        geom: (): string => `st_geomfromtext(
          'GEOMETRYCOLLECTION(${linesDto.wkt})')`,
      };
    });

    await this.linesDataRepository.save(linesDataEntities, { chunk: 100 });
  }

  public async uploadCsv(
    file: Express.Multer.File,
    linesDataCategory: LinesDataCategory,
    countryCodeISO3: string,
  ) {
    const linesCsv = await this.helperService.getCsvData<LinesDto>(file);

    const linesDtos = await this.getLinesDtos(linesDataCategory, linesCsv);

    await this.uploadJson(linesDataCategory, countryCodeISO3, linesDtos);
  }

  // NOTE: lines dtos are individual types of lines data
  // see LinesDataCategory enum for the supported categories
  public async getLinesDtos(
    linesDataCategory: LinesDataCategory,
    linesCsv: LinesDto[], // REFACTOR: create LinesCsv to avoid this mismatch
  ) {
    const validationErrors = [];
    const linesDtos = [];

    for (const [i, line] of linesCsv.entries()) {
      const linesDto = this.getLinesDto(linesDataCategory);

      // TODO: figure out why the for-loop is needed, its purpose is unclear
      for (const attribute in linesDto) {
        if (linesDto.hasOwnProperty(attribute)) {
          linesDto[attribute] = line[attribute];
        }
      }

      const validationError = await validate(linesDto);
      if (validationError.length > 0) {
        validationErrors.push({ lineNumber: i + 1, validationError });
      }

      linesDtos.push(linesDto);
    }

    if (validationErrors.length > 0) {
      throw new HttpException(validationErrors, HttpStatus.BAD_REQUEST);
    }

    return linesDtos;
  }

  public async uploadAssetExposureStatus({
    countryCodeISO3,
    disasterType,
    leadTime,
    linesDataCategory,
    date,
    exposedFids,
  }: UploadLinesExposureStatusDto) {
    // all assets within one upload should have the same timestamp
    // to make sure the asset exposure views work correctly
    date = date || new Date();

    const assets = await this.linesDataRepository.find({
      where: {
        referenceId: In(exposedFids),
        linesDataCategory,
        countryCodeISO3,
        active: true,
      },
    });

    const linesDataIds = assets.map(({ linesDataId }) => linesDataId);

    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      disasterType,
      date,
    );

    await this.linesDataDynamicStatusRepo.delete({
      linesData: { linesDataId: In(linesDataIds) },
      leadTime,
      timestamp: MoreThanOrEqual(uploadCutoffMoment),
    });

    const linesDataDynamicStatuses = assets.map((asset) => {
      const linesDataDynamicStatus = new LinesDataDynamicStatusEntity();

      linesDataDynamicStatus.linesData = asset;
      linesDataDynamicStatus.leadTime = leadTime;
      linesDataDynamicStatus.timestamp = date;
      linesDataDynamicStatus.exposed = true;

      return linesDataDynamicStatus;
    });

    return this.linesDataDynamicStatusRepo.save(linesDataDynamicStatuses);
  }
}
