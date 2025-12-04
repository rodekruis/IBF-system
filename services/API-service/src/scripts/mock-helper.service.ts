import { Injectable, Logger } from '@nestjs/common';

import fs from 'fs';
import path from 'path';

import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { UploadLinesExposureStatusDto } from '../api/lines-data/dto/upload-asset-exposure-status.dto';
import { LinesDataCategory } from '../api/lines-data/lines-data.entity';
import { LinesDataService } from '../api/lines-data/lines-data.service';
import { LayerMetadataEntity } from '../api/metadata/layer-metadata.entity';
import { UploadDynamicPointDataDto } from '../api/point-data/dto/upload-asset-exposure-status.dto';
import { PointDataCategory } from '../api/point-data/point-data.entity';
import { PointDataService } from '../api/point-data/point-data.service';
import { TyphoonTrackService } from '../api/typhoon-track/typhoon-track.service';
import { DisasterTypeGeoServerMapper } from './disaster-type-geoserver-file.mapper';
import { TyphoonScenario } from './enum/mock-scenario.enum';
import { Country } from './interfaces/country.interface';
import { Event } from './mock.service';

@Injectable()
export class MockHelperService {
  private logger = new Logger('MockHelperService');
  private rootDir = './src/scripts/mock-data';

  constructor(
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private linesDataService: LinesDataService,
    private pointDataService: PointDataService,
    private typhoonTrackService: TyphoonTrackService,
  ) {}

  public getFile(filePath: string) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      this.logger.warn(`Failed to read file: ${filePath}. ${error}`);
      return null;
    }
  }

  public async mockExposedAssets(
    countryCodeISO3: string,
    date: Date,
    scenarioName: string,
    { leadTime, eventName }: Event,
    layers: LayerMetadataEntity[],
  ) {
    for (const linesDataCategory of Object.keys(LinesDataCategory)) {
      if (!layers.some(({ name }) => name === linesDataCategory)) {
        continue;
      }

      const filePath = path.join(
        this.rootDir,
        DisasterType.FlashFloods,
        countryCodeISO3,
        scenarioName,
        eventName,
        'lines-data',
        `${linesDataCategory}.json`,
      );
      const exposedFids = this.getFile(filePath);

      if (!exposedFids) {
        this.logger.warn(
          `Exposed assets file not found: ${filePath}. Skipping.`,
        );
        continue;
      }

      const uploadLinesExposureStatusDto = new UploadLinesExposureStatusDto();
      uploadLinesExposureStatusDto.countryCodeISO3 = countryCodeISO3;
      uploadLinesExposureStatusDto.disasterType = DisasterType.FlashFloods;
      uploadLinesExposureStatusDto.linesDataCategory =
        linesDataCategory as LinesDataCategory;
      uploadLinesExposureStatusDto.leadTime = leadTime;
      uploadLinesExposureStatusDto.date = date;
      uploadLinesExposureStatusDto.exposedFids = exposedFids;

      await this.linesDataService.uploadAssetExposureStatus(
        uploadLinesExposureStatusDto,
      );
    }

    const pointDataCategories = [
      PointDataCategory.healthSites,
      PointDataCategory.schools,
      PointDataCategory.waterpoints,
    ];
    for (const pointDataCategory of pointDataCategories) {
      if (!layers.some(({ name }) => name === pointDataCategory)) {
        continue;
      }

      const filePath = path.join(
        this.rootDir,
        DisasterType.FlashFloods,
        countryCodeISO3,
        scenarioName,
        eventName,
        'point-data',
        `${pointDataCategory}.json`,
      );
      const dynamicPointData = this.getFile(filePath);

      if (!dynamicPointData) {
        this.logger.warn(
          `Dynamic point data file not found: ${filePath}. Skipping.`,
        );
        continue;
      }

      const uploadDynamicPointDataDto = new UploadDynamicPointDataDto();
      uploadDynamicPointDataDto.disasterType = DisasterType.FlashFloods;
      uploadDynamicPointDataDto.countryCodeISO3 = countryCodeISO3;
      uploadDynamicPointDataDto.pointDataCategory = pointDataCategory;
      uploadDynamicPointDataDto.key = 'exposure';
      uploadDynamicPointDataDto.leadTime = leadTime;
      uploadDynamicPointDataDto.date = date;
      uploadDynamicPointDataDto.dynamicPointData = dynamicPointData;

      await this.pointDataService.uploadDynamicPointData(
        uploadDynamicPointDataDto,
      );
    }
  }

  public async mockRiverGaugeData(
    countryCodeISO3: string,
    disasterType: DisasterType,
    scenarioName: string,
    date: Date,
  ) {
    const keys = [
      'water-level',
      'water-level-reference',
      'water-level-previous',
      'water-level-alert-level',
    ];

    for (const key of keys) {
      const filePath = path.join(
        this.rootDir,
        DisasterType.FlashFloods,
        countryCodeISO3,
        scenarioName,
        `dynamic-point-data_${key}.json`,
      );
      const dynamicPointData = this.getFile(filePath);

      if (!dynamicPointData) {
        this.logger.warn(
          `Dynamic point data file not found: ${filePath}. Skipping.`,
        );
        continue;
      }

      const payload = new UploadDynamicPointDataDto();
      payload.key = key;
      payload.leadTime = null;
      payload.date = date;
      payload.disasterType = disasterType;
      payload.countryCodeISO3 = countryCodeISO3;
      payload.pointDataCategory = PointDataCategory.gauges;
      payload.dynamicPointData = dynamicPointData;

      await this.pointDataService.uploadDynamicPointData(payload);
    }
  }

  public async mockRasterFile(
    { countryCodeISO3, countryDisasterSettings }: Country,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
    const leadTimes = countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).activeLeadTimes;
    for await (const leadTime of leadTimes) {
      this.logger.log(
        `Mock ${countryCodeISO3} ${leadTime} disaster extent raster`,
      );
      const sourceFileName = this.getMockRasterSourceFileName(
        disasterType,
        countryCodeISO3,
        leadTime,
        triggered,
      );
      const destFileName = this.getMockRasterDestFileName(
        disasterType,
        leadTime,
        countryCodeISO3,
      );

      if (!sourceFileName) {
        this.logger.log(
          `Mock ${countryCodeISO3} ${disasterType} ${leadTime} raster file not found. Skipping.`,
        );
        return;
      }

      // NOTE: this makes sure mock raster files are uploaded only once. If your intention is to have a different file, comment this out temporarily.
      const subfolder =
        DisasterTypeGeoServerMapper.getSubfolderForDisasterType(disasterType);
      if (
        fs.existsSync(
          `./geoserver-volume/raster-files/output/${subfolder}/${destFileName}`,
        )
      ) {
        this.logger.log(
          `File ${destFileName} already exists in output folder. Skipping.`,
        );
        continue;
      }
      // END NOTE

      let file;
      try {
        file = fs.readFileSync(
          `./geoserver-volume/raster-files/mock-output/${sourceFileName}`,
        );
      } catch {
        this.logger.log(`Raster file not found: ${sourceFileName}`);
        return;
      }

      const dataObject = { originalname: destFileName, buffer: file };
      await this.adminAreaDynamicDataService.postRaster(
        dataObject,
        disasterType,
      );
    }
  }

  public getMockRasterSourceFileName(
    disasterType: DisasterType,
    countryCodeISO3: string,
    leadTime: string,
    triggered?: boolean,
  ) {
    const directoryPath = './geoserver-volume/raster-files/mock-output/';
    const leadTimeUnit = leadTime.replace(/\d+-/, '');
    const leadTimePart =
      disasterType === DisasterType.FlashFloods ? leadTime : leadTimeUnit;

    if (!fs.existsSync(directoryPath)) {
      this.logger.log(`Directory does not exist: ${directoryPath}`);
      return null;
    }

    const files = fs.readdirSync(directoryPath);

    const layerStorePrefix =
      DisasterTypeGeoServerMapper.getLayerStorePrefixForDisasterType(
        disasterType,
      );

    // Only for Drought we have triggered and non-triggered files
    const suffix =
      triggered && [DisasterType.Drought].includes(disasterType)
        ? '-triggered.tif'
        : '.tif';
    const filename = `${layerStorePrefix}_${leadTimePart}_${countryCodeISO3}${suffix}`;
    const fileExists = files.includes(filename);
    if (fileExists) {
      return filename;
    } else {
      // new code
      const leadTimeNumber = parseInt(leadTime.split('-')[0]);
      const closestFiles = files.filter(
        (file) =>
          file.startsWith(layerStorePrefix) &&
          file.endsWith(`${leadTimeUnit}_${countryCodeISO3}${suffix}`),
      );
      // if no files are found, return null
      if (closestFiles.length === 0) {
        this.logger.log(`No closest files found for filename: ${filename}`);
        return null;
      }
      const numbersFromClosestFiles = closestFiles.map((file) =>
        parseInt(file.split('_')[2]),
      );
      // from the numbers, find the closest number to the leadTimeNumber
      let closestNumber = numbersFromClosestFiles[0];
      let index = 0;
      for (let i = 0; i < numbersFromClosestFiles.length; i++) {
        if (
          Math.abs(numbersFromClosestFiles[i] - leadTimeNumber) <
          Math.abs(closestNumber - leadTimeNumber)
        ) {
          closestNumber = numbersFromClosestFiles[i];
          index = i;
        }
      }
      return closestFiles[index];
    }
  }

  private getMockRasterDestFileName(
    disasterType: DisasterType,
    leadTime: string,
    countryCode: string,
  ): string {
    const prefix =
      DisasterTypeGeoServerMapper.getDestFilePrefixForDisasterType(
        disasterType,
      );
    return `${prefix}_${leadTime}_${countryCode}.tif`;
  }

  public getLeadTime(
    disasterType: DisasterType,
    selectedCountry: Country,
    eventName: string,
    leadTime: LeadTime,
    date: Date,
  ): LeadTime {
    if (disasterType !== DisasterType.Drought) {
      return leadTime;
    }

    const droughtCountrySettings = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === DisasterType.Drought,
    );

    // NOTE: in mock drought events, we fill this part behind the underscore to get the regionName. Pipelines will only upload the part before the underscore, as there's no use here for the other part.
    const regionName = eventName.split('_')[1];
    const seasonName = eventName.split('_')[0];
    const season =
      droughtCountrySettings.droughtSeasonRegions[regionName][seasonName]
        .rainMonths;

    // if current month is one of the months in the seasons, use '0-month'
    const currentMonth = new Date(date).getUTCMonth() + 1;
    if (season.includes(currentMonth)) {
      return LeadTime.month0;
    }

    // otherwise, calculate the difference between the current month and the start of the season
    const startOfSeasonMonth = season[0];
    if (currentMonth < startOfSeasonMonth) {
      const diff = startOfSeasonMonth - currentMonth;
      return `${diff}-month` as LeadTime;
    } else if (currentMonth > startOfSeasonMonth) {
      const diff = 12 - currentMonth + startOfSeasonMonth;
      return `${diff}-month` as LeadTime;
    }
  }

  public skipLeadTime(disasterType: DisasterType, leadTime: LeadTime): boolean {
    if (disasterType === DisasterType.Drought) {
      if (Number(leadTime.split('-')[0]) > 3) {
        return true;
      }
    }
    return false;
  }

  public async mockTyphoonTrack(
    countryCodeISO3: string,
    scenarioName: string,
    event: Event,
    date: Date,
  ) {
    const filePath = path.join(
      this.rootDir,
      DisasterType.Typhoon,
      countryCodeISO3,
      scenarioName,
      event.eventName,
      'typhoon-track.json',
    );
    const track = this.getFile(filePath);

    if (!track) {
      this.logger.warn(`Typhoon track file not found: ${filePath}. Skipping.`);
      return;
    }

    // Overwrite timestamps of trackpoints to align with today's date
    // Make sure that the moment of landfall lies just ahead
    let i = scenarioName === TyphoonScenario.OngoingTrigger ? -29 : -23;
    for (const trackpoint of track) {
      const now = new Date(date) || new Date();
      trackpoint.timestampOfTrackpoint = new Date(
        now.getTime() + i * (1000 * 60 * 60 * 6),
      );
      i += 1;
    }

    await this.typhoonTrackService.uploadTyphoonTrack({
      countryCodeISO3,
      leadTime: event.leadTime,
      eventName: event.eventName,
      trackpointDetails: track,
      date,
    });
  }
}
