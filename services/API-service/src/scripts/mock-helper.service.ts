import fs from 'fs';
import { Injectable } from '@nestjs/common';

import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { EventService } from '../api/event/event.service';
import { UploadLinesExposureStatusDto } from '../api/lines-data/dto/upload-asset-exposure-status.dto';
import { LinesDataEnum } from '../api/lines-data/lines-data.entity';
import { LinesDataService } from '../api/lines-data/lines-data.service';
import { UploadDynamicPointDataDto } from '../api/point-data/dto/upload-asset-exposure-status.dto';
import { PointDataEnum } from '../api/point-data/point-data.entity';
import { PointDataService } from '../api/point-data/point-data.service';
import { DisasterTypeGeoServerMapper } from './disaster-type-geoserver-file.mapper';

@Injectable()
export class MockHelperService {
  constructor(
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private eventService: EventService,
    private linesDataService: LinesDataService,
    private pointDataService: PointDataService,
  ) {}

  public async mockExposedAssets(
    countryCodeISO3: string,
    triggered: boolean,
    date: Date,
  ) {
    if (countryCodeISO3 !== 'MWI' || !triggered) {
      return;
    }

    for (const leadTime of [LeadTime.hour24, LeadTime.hour6]) {
      for (const assetType of Object.keys(LinesDataEnum)) {
        const payload = new UploadLinesExposureStatusDto();
        payload.countryCodeISO3 = countryCodeISO3;
        payload.disasterType = DisasterType.FlashFloods;
        payload.linesDataCategory = assetType as LinesDataEnum;
        payload.leadTime = leadTime;
        payload.date = date || new Date();
        const filename = `./src/api/lines-data/dto/example/${countryCodeISO3}/${DisasterType.FlashFloods}/${assetType}.json`;
        const assets = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        // add mock data per lead-time in the respecitve json file
        payload.exposedFids = assets[leadTime] ? assets[leadTime] : [];

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
        payload.leadTime = leadTime;
        payload.date = date || new Date();

        const filename = `./src/api/point-data/dto/example/${countryCodeISO3}/${DisasterType.FlashFloods}/${pointAssetType}.json`;
        const assets = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        // add mock data per lead-time in the respecitve json file
        payload.dynamicPointData = assets[leadTime] ? assets[leadTime] : [];

        await this.pointDataService.uploadDynamicPointData(payload);
      }
    }
  }

  public async mockDynamicPointData(
    countryCodeISO3: string,
    disasterType: DisasterType,
    date: Date,
  ) {
    if (countryCodeISO3 !== 'MWI') {
      return;
    }

    const keys = [
      'water-level',
      'water-level-reference',
      'water-level-previous',
    ];
    for (const key of keys) {
      const payload = new UploadDynamicPointDataDto();
      payload.key = key;
      payload.leadTime = null;
      payload.date = date || new Date();
      payload.disasterType = disasterType;
      const filename = `./src/api/point-data/dto/example/${countryCodeISO3}/${DisasterType.FlashFloods}/dynamic-point-data_${key}.json`;
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
            ` for disaster: ${disasterType}` +
            ` for leadtime: ${leadTime}. Skipping.`,
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
        console.log(
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
      } catch (error) {
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
    const filename = `${layerStorePrefix}_${leadTimeUnit}_${countryCodeISO3}${suffix}`;
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
      for (let i = 1; i < numbersFromClosestFiles.length; i++) {
        if (
          Math.abs(numbersFromClosestFiles[i] - leadTimeNumber) <
          Math.abs(closestNumber - leadTimeNumber)
        ) {
          closestNumber = numbersFromClosestFiles[i];
        }
      }
      return null;
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
}
