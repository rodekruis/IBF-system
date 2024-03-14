import { Injectable } from '@nestjs/common';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import fs from 'fs';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { MetadataService } from '../api/metadata/metadata.service';
import { DynamicIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-data-unit';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { AdminLevel } from '../api/country/admin-level.enum';
import { EventService } from '../api/event/event.service';
import countries from './json/countries.json';
import { UploadLinesExposureStatusDto } from '../api/lines-data/dto/upload-asset-exposure-status.dto';
import { LinesDataEnum } from '../api/lines-data/lines-data.entity';
import { UploadDynamicPointDataDto } from '../api/point-data/dto/upload-asset-exposure-status.dto';
import { PointDataEnum } from '../api/point-data/point-data.entity';
import { LinesDataService } from '../api/lines-data/lines-data.service';
import { PointDataService } from '../api/point-data/point-data.service';
import { GlofasStationService } from '../api/glofas-station/glofas-station.service';
import {
  MockEpidemicsScenario,
  MockFlashFloodsScenario,
  MockFloodsScenario,
} from './mock.controller';

class Scenario {
  scenarioName: string;
  defaultScenario?: boolean;
  events: { eventName: string; leadTime: LeadTime }[];
}

@Injectable()
export class MockService {
  constructor(
    private metadataService: MetadataService,
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private eventService: EventService,
    private linesDataService: LinesDataService,
    private pointDataService: PointDataService,
    private glofasStationService: GlofasStationService,
  ) {}

  public async mock(
    mockBody:
      | MockFloodsScenario
      | MockEpidemicsScenario
      | MockFlashFloodsScenario,
    disasterType: DisasterType,
    defaultScenario: boolean,
  ) {
    if (mockBody.removeEvents) {
      console.log('mockBody.removeEvents: ', mockBody.removeEvents);
      // this.removeEvents()
    }

    const selectedCountry = countries.find((country): any => {
      if (mockBody.countryCodeISO3 === country.countryCodeISO3) {
        return country;
      }
    });

    const scenario = await this.getScenario(
      disasterType,
      mockBody.countryCodeISO3,
      mockBody.scenario,
      defaultScenario,
    );

    const adminLevels = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).adminLevels;

    const indicators = await this.getIndicators(
      mockBody.countryCodeISO3,
      disasterType,
    );

    for (const event of scenario.events) {
      for (const indicator of indicators) {
        for (const adminLevel of adminLevels) {
          const exposurePlaceCodes = this.getIndicatorPlaceCodes(
            disasterType,
            mockBody.countryCodeISO3,
            scenario.scenarioName,
            event.eventName,
            indicator,
            adminLevel,
          );

          if (!exposurePlaceCodes) {
            console.error('NO FILE!!!', indicator);
            continue;
          }

          await this.adminAreaDynamicDataService.exposure({
            countryCodeISO3: mockBody.countryCodeISO3,
            exposurePlaceCodes,
            leadTime: event.leadTime as LeadTime,
            dynamicIndicator: indicator,
            adminLevel: adminLevel,
            disasterType: disasterType,
            eventName: event.eventName,
            date: mockBody.date,
          });
        }
      }

      if (this.shouldMockTriggerPerLeadTime(disasterType)) {
        const triggersPerLeadTime = this.getFile(
          `./src/scripts/mock-data/${disasterType}/${mockBody.countryCodeISO3}/${scenario.scenarioName}/${event.eventName}/triggers-per-leadtime.json`,
        );
        await this.eventService.uploadTriggerPerLeadTime({
          countryCodeISO3: mockBody.countryCodeISO3,
          triggersPerLeadTime,
          disasterType: DisasterType.Floods,
          eventName: event.eventName,
          date: mockBody.date,
        });
      }

      if (this.shouldMockGlofasStations(disasterType)) {
        await this.mockGlofasStations(
          selectedCountry,
          DisasterType.Floods,
          true,
          mockBody.date,
        );
      }

      if (disasterType === DisasterType.FlashFloods) {
        // TODO: the below methods are now duplidated between mock.service and scrpts.service
        // TODO: the below methods still assume hard-coded leadTimes and is not flexible
        await this.mockExposedAssets(
          selectedCountry.countryCodeISO3,
          true, // TODO: assume triggered, no-trigger for now done via old endpoint
          mockBody.date,
        );
        await this.mockDynamicPointData(
          selectedCountry.countryCodeISO3,
          DisasterType.FlashFloods,
          mockBody.date,
        );

        // TODO: raster-file
      }
    }
  }

  public async getScenario(
    disasterType: DisasterType,
    countryCodeISO3: string,
    scenarioName: string,
    defaultScenario = false,
  ): Promise<Scenario> {
    const scenarios: Scenario[] = this.getFile(
      `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/scenarios.json`,
    );

    if (defaultScenario) {
      return scenarios.find((scenario) => scenario.defaultScenario === true);
    }

    return scenarios.find((scenario) => scenario.scenarioName === scenarioName);
  }

  private getFile(fileName: string) {
    let file = null;
    try {
      file = fs.readFileSync(fileName, 'utf8');
    } catch (err) {
      console.log('err: ', err);
      return null;
    }
    return JSON.parse(file);
  }

  private async getIndicators(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    const indicators =
      await this.metadataService.getIndicatorsByCountryAndDisaster(
        countryCodeISO3,
        disasterType,
      );
    const exposureUnits = indicators
      .filter((ind) => ind.dynamic)
      .map((ind) => ind.name as DynamicIndicator);

    // Make sure 'alert threshold' is uploaded last
    return exposureUnits.sort((a, _b) =>
      a === DynamicIndicator.alertThreshold ? 1 : -1,
    );
  }

  private getIndicatorPlaceCodes(
    disasterType: DisasterType,
    countryCodeISO3: string,
    scenarioName: string,
    eventName: string,
    indicator: DynamicIndicator,
    adminLevel: AdminLevel,
  ) {
    return this.getFile(
      `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenarioName}/${eventName}/upload-${indicator}-${adminLevel}.json`,
    );
  }

  private async mockGlofasStations(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
    date: Date,
  ) {
    const stations = this.getFile(
      `./src/api/point-data/dto/example/glofas-stations/glofas-stations-${
        selectedCountry.countryCodeISO3
      }${triggered ? '-triggered' : ''}.json`,
    );

    for (const activeLeadTime of selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).activeLeadTimes) {
      console.log(
        `Seeding Glofas stations for country: ${selectedCountry.countryCodeISO3} for leadtime: ${activeLeadTime}`,
      );
      await this.glofasStationService.uploadTriggerDataPerStation({
        countryCodeISO3: selectedCountry.countryCodeISO3,
        stationForecasts: stations,
        leadTime: activeLeadTime as LeadTime,
        date,
      });
    }
  }

  private async mockExposedAssets(
    countryCodeISO3: string,
    triggered: boolean,
    date: Date,
  ) {
    if (countryCodeISO3 !== 'MWI' || !triggered) {
      return;
    }
    const pointDataCategories = [
      PointDataEnum.healthSites,
      PointDataEnum.schools,
      PointDataEnum.waterpointsInternal,
    ];
    for (const leadTime of [LeadTime.hour24, LeadTime.hour6]) {
      for (const assetType of Object.keys(LinesDataEnum)) {
        const payload = new UploadLinesExposureStatusDto();
        payload.countryCodeISO3 = countryCodeISO3;
        payload.disasterType = DisasterType.FlashFloods;
        payload.linesDataCategory = assetType as LinesDataEnum;
        payload.leadTime = leadTime;
        payload.date = date || new Date();
        if (assetType === LinesDataEnum.roads) {
          const filename = `./src/api/lines-data/dto/example/${countryCodeISO3}/${DisasterType.FlashFloods}/${assetType}.json`;
          const assets = JSON.parse(fs.readFileSync(filename, 'utf-8'));
          leadTime === LeadTime.hour24
            ? (payload.exposedFids = assets[LeadTime.hour24])
            : leadTime === LeadTime.hour6
            ? (payload.exposedFids = assets[LeadTime.hour6])
            : [];
        } else if (assetType === LinesDataEnum.buildings) {
          const filename = `./src/api/lines-data/dto/example/${countryCodeISO3}/${DisasterType.FlashFloods}/${assetType}.json`;
          const assets = JSON.parse(fs.readFileSync(filename, 'utf-8'));
          leadTime === LeadTime.hour24
            ? (payload.exposedFids = assets[LeadTime.hour24])
            : leadTime === LeadTime.hour6
            ? (payload.exposedFids = assets[LeadTime.hour6])
            : [];
        }
        await this.linesDataService.uploadAssetExposureStatus(payload);
      }

      for (const pointAssetType of pointDataCategories) {
        const payload = new UploadDynamicPointDataDto();
        payload.disasterType = DisasterType.FlashFloods;
        payload.key = 'exposure';
        payload.leadTime = leadTime;
        payload.date = date || new Date();
        if (pointAssetType === PointDataEnum.healthSites) {
          leadTime === LeadTime.hour24
            ? (payload.dynamicPointData = [])
            : leadTime === LeadTime.hour6
            ? (payload.dynamicPointData = [{ fid: '124', value: 'true' }])
            : [];
        } else if (pointAssetType === PointDataEnum.schools) {
          leadTime === LeadTime.hour24
            ? (payload.dynamicPointData = [{ fid: '167', value: 'true' }])
            : leadTime === LeadTime.hour6
            ? (payload.dynamicPointData = [])
            : [];
        } else if (pointAssetType === PointDataEnum.waterpointsInternal) {
          const filename = `./src/api/point-data/dto/example/${countryCodeISO3}/${DisasterType.FlashFloods}/${pointAssetType}.json`;
          const assets = JSON.parse(fs.readFileSync(filename, 'utf-8'));
          leadTime === LeadTime.hour24
            ? (payload.dynamicPointData = assets[LeadTime.hour24])
            : leadTime === LeadTime.hour6
            ? (payload.dynamicPointData = assets[LeadTime.hour6])
            : [];
        }
        await this.pointDataService.uploadDynamicPointData(payload);
      }
    }
  }

  private async mockDynamicPointData(
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

  private shouldMockGlofasStations(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Floods;
  }

  private shouldMockTriggerPerLeadTime(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Floods;
  }
}
