import fs from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';

import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { UploadLinesExposureStatusDto } from '../api/lines-data/dto/upload-asset-exposure-status.dto';
import { LinesDataEnum } from '../api/lines-data/lines-data.entity';
import { LinesDataService } from '../api/lines-data/lines-data.service';
import { UploadDynamicPointDataDto } from '../api/point-data/dto/upload-asset-exposure-status.dto';
import { PointDataEnum } from '../api/point-data/point-data.entity';
import { PointDataService } from '../api/point-data/point-data.service';
import { TyphoonTrackService } from '../api/typhoon-track/typhoon-track.service';
import { DisasterTypeGeoServerMapper } from './disaster-type-geoserver-file.mapper';
import { TyphoonScenario } from './enum/mock-scenario.enum';
import { Country } from './interfaces/country.interface';
import { Event } from './mock.service';

@Injectable()
export class MockHelperService {
  constructor(
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private linesDataService: LinesDataService,
    private pointDataService: PointDataService,
    private typhoonTrackService: TyphoonTrackService,
  ) {}

  public async mockExposedAssets(
    countryCodeISO3: string,
    date: Date,
    scenarioName: string,
    event: Event,
  ) {
    for (const assetType of Object.keys(LinesDataEnum)) {
      const payload = new UploadLinesExposureStatusDto();
      payload.countryCodeISO3 = countryCodeISO3;
      payload.disasterType = DisasterType.FlashFloods;
      payload.linesDataCategory = assetType as LinesDataEnum;
      payload.leadTime = event.leadTime;
      payload.date = date;
      const filename = `./src/scripts/mock-data/${DisasterType.FlashFloods}/${countryCodeISO3}/${scenarioName}/${event.eventName}/lines-data/${assetType}.json`;
      const assets = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      payload.exposedFids = assets;

      await this.linesDataService.uploadAssetExposureStatus(payload);
    }

    const pointDataCategories = [
      PointDataEnum.healthSites,
      PointDataEnum.schools,
      PointDataEnum.waterpointsInternal,
    ];
    for (const pointAssetType of pointDataCategories) {
      const payload = new UploadDynamicPointDataDto();
      payload.disasterType = DisasterType.FlashFloods;
      payload.key = 'exposure';
      payload.leadTime = event.leadTime;
      payload.date = date || new Date();

      const filename = `./src/scripts/mock-data/${DisasterType.FlashFloods}/${countryCodeISO3}/${scenarioName}/${event.eventName}/point-data/${pointAssetType}.json`;
      const assets = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      payload.dynamicPointData = assets;

      await this.pointDataService.uploadDynamicPointData(payload);
    }
  }

  public async mockDynamicPointData(
    countryCodeISO3: string,
    disasterType: DisasterType,
    scenarioName: string,
    date: Date,
  ) {
    const keys = [
      'water-level',
      'water-level-reference',
      'water-level-previous',
    ];
    for (const key of keys) {
      const payload = new UploadDynamicPointDataDto();
      payload.key = key;
      payload.leadTime = null;
      payload.date = date;
      payload.disasterType = disasterType;
      const filename = `./src/scripts/mock-data/${DisasterType.FlashFloods}/${countryCodeISO3}/${scenarioName}/dynamic-point-data_${key}.json`;
      const dynamicPointData = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      payload.dynamicPointData = dynamicPointData;

      await this.pointDataService.uploadDynamicPointData(payload);
    }
  }

  public async mockRasterFile(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
    const leadTimes = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).activeLeadTimes;
    for await (const leadTime of leadTimes) {
      console.log(
        `Seeding disaster extent raster file for country: ${selectedCountry.countryCodeISO3} for leadtime: ${leadTime}`,
      );
      const sourceFileName = this.getMockRasterSourceFileName(
        disasterType,
        selectedCountry.countryCodeISO3,
        leadTime,
        triggered,
      );
      const destFileName = this.getMockRasterDestFileName(
        disasterType,
        leadTime,
        selectedCountry.countryCodeISO3,
      );

      if (!sourceFileName) {
        console.log(
          'Mock raster file not found' +
            ` for country: ${selectedCountry.countryCodeISO3}` +
            ` for disasterType: ${disasterType}` +
            ` for leadtime: ${leadTime}. Skipping.`,
        );
        return;
      }

      // NOTE: this makes sure mock raster files are uploaded only once. If your intention is to have a different file, comment this out temporarily.
      // const subfolder =
      //   DisasterTypeGeoServerMapper.getSubfolderForDisasterType(disasterType);
      // if (
      //   fs.existsSync(
      //     `./geoserver-volume/raster-files/output/${subfolder}/${destFileName}`,
      //   )
      // ) {
      //   console.log(
      //     `File ${destFileName} already exists in output folder. Skipping.`,
      //   );
      //   continue;
      // }
      // END NOTE

      let file;
      try {
        file = fs.readFileSync(
          `./geoserver-volume/raster-files/mock-output/${sourceFileName}`,
        );
      } catch {
        console.log(`ERROR: ${sourceFileName} not found.`);
        return;
      }

      const dataObject = {
        originalname: destFileName,
        buffer: file,
      };
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
      console.log(`Directory ${directoryPath} does not exist.`);
      return null;
    }

    const files = fs.readdirSync(directoryPath);

    const layerStorePrefix =
      DisasterTypeGeoServerMapper.getLayerStorePrefixForDisasterType(
        disasterType,
      );

    // Only for HeavyRain and Drought we have triggered and non-triggered files
    const suffix =
      triggered &&
      [DisasterType.HeavyRain, DisasterType.Drought].includes(disasterType)
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
        console.log(
          'No closest files found for the given lead time',
          layerStorePrefix,
          leadTimeUnit,
          countryCodeISO3,
          suffix,
        );
        return null;
      }
      const numbersFromClosestFiles = closestFiles.map((file) =>
        parseInt(file.split('_')[2]),
      );
      // from the numbers, find the closest number to the leadTimeNumber
      let closestNumber = numbersFromClosestFiles[0];
      let index: number;
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

    const regionName = eventName.split('_')[1];
    const seasonName = eventName.split('_')[0];
    const season =
      droughtCountrySettings.droughtSeasonRegions[regionName][seasonName]
        .rainMonths;

    // if current month is one of the months in the seasons, use '0-month'
    let currentMonth = new Date(date).getUTCMonth() + 1;
    // Refactor: this 'endOfMonthPipeline' feature can hopefully be dropped soon
    const endOfMonthPipeline = droughtCountrySettings.droughtEndOfMonthPipeline;
    if (endOfMonthPipeline) {
      currentMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    }

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

  public getLeadTimeDroughtNoEvents(
    selectedCountry: Country,
    date: Date,
  ): LeadTime {
    const droughtSeasonRegions = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === DisasterType.Drought,
    ).droughtSeasonRegions;

    // for no events, look at all seasons in all regions
    let minDiff = 12;
    const currentMonth = new Date(date).getUTCMonth() + 1;
    for (const regionName of Object.keys(droughtSeasonRegions)) {
      for (const seasonName of Object.keys(droughtSeasonRegions[regionName])) {
        const season = droughtSeasonRegions[regionName][seasonName].rainMonths;
        if (season.includes(currentMonth)) {
          // .. if ongoing in any season, then return '0-month'
          return LeadTime.month0;
        }
        // .. otherwise calculate smallest leadTime until first upcoming season
        let diff: number;
        if (currentMonth <= season[0]) {
          diff = season[0] - currentMonth;
        } else if (currentMonth > season[0]) {
          diff = 12 - currentMonth + season[0];
        }
        if (diff < minDiff) {
          minDiff = diff;
        }
      }
    }

    return `${minDiff}-month` as LeadTime;
  }

  public async mockTyphoonTrack(
    countryCodeISO3: string,
    scenarioName: string,
    event: Event,
    date: Date,
  ) {
    const ROOT_DIR = path.resolve('./src/scripts/mock-data');
    const filePath = path.resolve(
      ROOT_DIR,
      `${DisasterType.Typhoon}/${countryCodeISO3}/${scenarioName}/${event.eventName}/typhoon-track.json`,
    );
    if (!filePath.startsWith(ROOT_DIR)) {
      throw new Error('Invalid file path');
    }
    const trackRaw = fs.readFileSync(filePath, 'utf-8');
    const track = JSON.parse(trackRaw);

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
