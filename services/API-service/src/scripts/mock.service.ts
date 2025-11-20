import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AdminAreaService } from '../api/admin-area/admin-area.service';
import { AdminAreaDynamicDataEntity } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { DynamicIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { AdminLevel } from '../api/country/admin-level.enum';
import { CountryEntity } from '../api/country/country.entity';
import { CountryDisasterSettingsDto } from '../api/country/dto/country.dto';
import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { EapActionStatusEntity } from '../api/eap-actions/eap-action-status.entity';
import { AlertPerLeadTimeEntity } from '../api/event/alert-per-lead-time.entity';
import { EventService } from '../api/event/event.service';
import { EventPlaceCodeEntity } from '../api/event/event-place-code.entity';
import { LayerMetadataEntity } from '../api/metadata/layer-metadata.entity';
import { MetadataService } from '../api/metadata/metadata.service';
import { PointDataCategory } from '../api/point-data/point-data.entity';
import { PointDataService } from '../api/point-data/point-data.service';
import { ProcessEventsService } from '../api/process-events/process-events.service';
import { TyphoonTrackService } from '../api/typhoon-track/typhoon-track.service';
import { DEV, MOCK_USE_OLD_PIPELINE_UPLOAD } from '../config';
import { MockDto } from './dto/mock.dto';
import {
  DroughtScenario,
  FlashFloodsScenario,
  FloodsScenario,
  MalariaScenario,
  TyphoonScenario,
} from './enum/mock-scenario.enum';
import { GeoserverSyncService } from './geoserver-sync.service';
import { Country } from './interfaces/country.interface';
import countries from './json/countries.json';
import { MockHelperService } from './mock-helper.service';

class Scenario {
  scenarioName: string;
  defaultScenario?: boolean;
  events: Event[];
}
export class Event {
  eventName: string;
  leadTime?: LeadTime;
}

@Injectable()
export class MockService {
  private logger = new Logger('MockService');

  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(AlertPerLeadTimeEntity)
  private readonly alertPerLeadTimeRepo: Repository<AlertPerLeadTimeEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepo: Repository<EapActionStatusEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepo: Repository<CountryEntity>;

  constructor(
    private metadataService: MetadataService,
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private eventService: EventService,
    private processEventsService: ProcessEventsService,
    private pointDataService: PointDataService,
    private adminAreaService: AdminAreaService,
    private typhoonTrackService: TyphoonTrackService,
    private mockHelperService: MockHelperService,
    private geoServerSyncService: GeoserverSyncService,
  ) {}

  public async mockCountryDisasterTypeData(
    countryCodeISO3: string,
    removeEvents: boolean,
    date: Date,
    scenarioName:
      | FloodsScenario
      | FlashFloodsScenario
      | TyphoonScenario
      | DroughtScenario
      | MalariaScenario,
    disasterType: DisasterType,
    useDefaultScenario: boolean,
    noNotifications: boolean,
  ) {
    const scenario = await this.getScenario(
      disasterType,
      countryCodeISO3,
      scenarioName,
      useDefaultScenario,
    );
    if (!scenario) {
      this.logger.log(
        `Scenario ${scenarioName} not found for country ${countryCodeISO3} and disasterType ${disasterType}`,
      );
      return;
    }

    if (removeEvents) {
      await this.removeEvents(countryCodeISO3, disasterType);
    }
    date = date || new Date();

    const selectedCountry = countries.find((country) => {
      if (countryCodeISO3 === country.countryCodeISO3) {
        return country;
      }
    }) as Country;

    const disasterSettings: CountryDisasterSettingsDto[] | undefined =
      selectedCountry.countryDisasterSettings;
    if (!disasterSettings) {
      this.logger.error(
        `Disaster settings not found for country: ${countryCodeISO3} and disaster type: ${disasterType}`,
      );
    }
    const adminLevels = disasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).adminLevels;

    const indicators = await this.getIndicators(countryCodeISO3, disasterType);
    const layers = await this.metadataService.getLayersByCountryAndDisaster(
      countryCodeISO3,
      disasterType,
    );

    if (!scenario.events) {
      // No events scenario
      await this.uploadNoEvents(
        disasterType,
        selectedCountry,
        date,
        indicators,
        adminLevels,
      );
    } else {
      let eventsSkipped = 0;
      for (const event of scenario.events) {
        const leadTime = this.mockHelperService.getLeadTime(
          disasterType,
          selectedCountry,
          event.eventName,
          event.leadTime,
          date,
        );

        if (this.mockHelperService.skipLeadTime(disasterType, leadTime)) {
          eventsSkipped += 1;
          if (eventsSkipped < scenario.events.length) {
            // if not yet all events are skipped, then just skip this one and continue to the next event
            continue;
          } else if (eventsSkipped === scenario.events.length) {
            // if all events are skipped, upload no events instead and skip the rest of the loop
            await this.uploadNoEvents(
              disasterType,
              selectedCountry,
              date,
              indicators,
              adminLevels,
            );
            continue;
          }
        }

        for (const indicator of indicators) {
          for (const adminLevel of adminLevels) {
            const exposurePlaceCodes = this.getMockExposureData(
              disasterType,
              countryCodeISO3,
              scenario.scenarioName,
              event.eventName,
              indicator,
              adminLevel,
            );

            if (!exposurePlaceCodes) {
              this.logger.error(`No data found for indicator: ${indicator}`);
              continue;
            }

            await this.adminAreaDynamicDataService.exposure({
              countryCodeISO3,
              exposurePlaceCodes,
              leadTime,
              dynamicIndicator: indicator,
              adminLevel,
              disasterType,
              eventName: event.eventName,
              date,
            });
          }
        }

        if (this.shouldMockAlertPerLeadTime(disasterType)) {
          if (MOCK_USE_OLD_PIPELINE_UPLOAD) {
            // Old endpoint
            const triggersPerLeadTime = this.mockHelperService.getFile(
              `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenario.scenarioName}/${event.eventName}/triggers-per-lead-time.json`,
            );

            await this.eventService.convertOldDtoAndUploadAlertPerLeadTime({
              countryCodeISO3,
              triggersPerLeadTime,
              disasterType: DisasterType.Floods,
              eventName: event.eventName,
              date,
            });
          } else {
            const alertsPerLeadTime = this.mockHelperService.getFile(
              `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenario.scenarioName}/${event.eventName}/alerts-per-lead-time.json`,
            );

            await this.eventService.uploadAlertsPerLeadTime({
              countryCodeISO3,
              alertsPerLeadTime,
              disasterType: DisasterType.Floods,
              eventName: event.eventName,
              date,
            });
          }
        }

        if (this.shouldMockTyphoonTrack(disasterType)) {
          await this.mockHelperService.mockTyphoonTrack(
            countryCodeISO3,
            scenario.scenarioName,
            event,
            date as Date,
          );
        }

        if (this.shouldMockGlofasStations(disasterType)) {
          await this.mockGlofasStations(
            selectedCountry,
            DisasterType.Floods,
            date,
            scenario.scenarioName,
            event,
          );
        }

        if (this.shouldMockExposedAssets(disasterType)) {
          await this.mockHelperService.mockExposedAssets(
            selectedCountry.countryCodeISO3,
            date,
            scenario.scenarioName,
            event,
            layers,
          );
        }
      }
    }

    if (this.shouldMockRasterFile(disasterType)) {
      await this.mockHelperService.mockRasterFile(
        selectedCountry,
        disasterType,
        scenario.events?.length > 0,
      );
    }

    if (this.shouldMockGlofasStations(disasterType)) {
      // This uploads all non-alerted stations outside of the event-loop
      await this.mockGlofasStations(
        selectedCountry,
        disasterType,
        date,
        scenario.scenarioName,
      );
    }

    if (await this.shouldMockRiverGaugeData(layers, scenario.scenarioName)) {
      await this.mockHelperService.mockRiverGaugeData(
        selectedCountry.countryCodeISO3,
        disasterType,
        scenario.scenarioName,
        date,
      );
    }

    // Process events
    await this.processEventsService.processEvents(
      selectedCountry.countryCodeISO3,
      disasterType,
      noNotifications,
    );

    // Add the needed stores and layers to geoserver, only do this in debug mode
    // The resulting XML files should be commited to git and will end up on the servers that way
    if (DEV && !noNotifications) {
      await this.geoServerSyncService.sync(
        selectedCountry.countryCodeISO3,
        disasterType,
      );
    }
  }

  private async uploadNoEvents(
    disasterType: DisasterType,
    selectedCountry: Country,
    date: Date,
    indicators: DynamicIndicator[],
    adminLevels: AdminLevel[],
  ) {
    const adminAreas = await this.adminAreaService.getAdminAreasRaw(
      selectedCountry.countryCodeISO3,
    );
    const leadTimesForNoEvents = await this.eventService.getLeadTimesNoEvents(
      disasterType,
      selectedCountry.countryCodeISO3,
      date,
    );
    for (const indicator of indicators) {
      for (const adminLevel of adminLevels) {
        const exposurePlaceCodes = adminAreas
          .filter((area) => area.adminLevel === adminLevel)
          .map((area) => ({ placeCode: area.placeCode, amount: 0 }));
        for (const leadTime of leadTimesForNoEvents) {
          await this.adminAreaDynamicDataService.exposure({
            countryCodeISO3: selectedCountry.countryCodeISO3,
            exposurePlaceCodes,
            leadTime: leadTime as LeadTime,
            dynamicIndicator: indicator,
            adminLevel,
            disasterType,
            eventName: null,
            date,
          });
        }
      }
    }

    if (this.shouldMockTyphoonTrack(disasterType)) {
      await this.typhoonTrackService.uploadTyphoonTrack({
        countryCodeISO3: selectedCountry.countryCodeISO3,
        leadTime: leadTimesForNoEvents[0] as LeadTime,
        eventName: null,
        trackpointDetails: [],
        date,
      });
    }
  }

  private async getScenario(
    disasterType: DisasterType,
    countryCodeISO3: string,
    scenarioName: string,
    defaultScenario = false,
  ): Promise<Scenario> {
    const scenarios: Scenario[] = this.mockHelperService.getFile(
      `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/scenarios.json`,
    );

    if (defaultScenario) {
      return scenarios.find((scenario) => scenario.defaultScenario === true);
    }

    return scenarios.find((scenario) => scenario.scenarioName === scenarioName);
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
    const dynamicIndicators = indicators
      .filter((ind) => ind.dynamic && ind.name !== DynamicIndicator.trigger)
      .map((ind) => ind.name as DynamicIndicator);

    if (disasterType === DisasterType.Typhoon) {
      dynamicIndicators.push(DynamicIndicator.showAdminArea);
    }

    // NOTE: update this when all pipelines migrated to new setup.
    if (MOCK_USE_OLD_PIPELINE_UPLOAD) {
      dynamicIndicators.push(DynamicIndicator.alertThreshold);
    } else {
      // REFACTOR: these indicators always need to be mocked, but are not user-facing layers and thus not in indicator-metadata.json. Refactor this setup.
      dynamicIndicators.push(
        ...[
          DynamicIndicator.forecastSeverity,
          DynamicIndicator.forecastTrigger,
        ],
      );
    }

    return dynamicIndicators;
  }

  private getMockExposureData(
    disasterType: DisasterType,
    countryCodeISO3: string,
    scenarioName: string,
    eventName: string,
    indicator: DynamicIndicator,
    adminLevel: AdminLevel,
  ) {
    return this.mockHelperService.getFile(
      `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenarioName}/${eventName}/upload-${indicator}-${adminLevel}.json`,
    );
  }

  private async mockGlofasStations(
    { countryCodeISO3 }: Country,
    disasterType: DisasterType,
    date: Date,
    scenarioName: string,
    event?: Event,
  ) {
    let stationForecasts;
    let leadTime;
    if (event) {
      stationForecasts = this.mockHelperService.getFile(
        `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenarioName}/${event.eventName}/glofas-station.json`,
      );
      leadTime = event.leadTime;
    } else {
      stationForecasts = this.mockHelperService.getFile(
        `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenarioName}/glofas-stations-no-alert.json`,
      );
      leadTime = LeadTime.day7; // last available leadTime across all floods countries;
    }

    this.logger.log(`Mock ${countryCodeISO3} ${leadTime} glofas stations`);
    await this.pointDataService.reformatAndUploadOldGlofasStationData({
      countryCodeISO3,
      stationForecasts,
      leadTime,
      date,
    });
  }

  private async removeEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    const allCountryEvents = await this.eventPlaceCodeRepo.find({
      relations: ['eapActionStatuses', 'adminArea'],
      where: { adminArea: { countryCodeISO3 }, disasterType },
    });
    await this.alertPerLeadTimeRepo.delete({ countryCodeISO3, disasterType });
    await this.adminAreaDynamicDataRepo.delete({
      countryCodeISO3,
      disasterType,
    });

    for (const event of allCountryEvents) {
      await this.eapActionStatusRepo.remove(event.eapActionStatuses);
    }
    await this.eventPlaceCodeRepo.remove(allCountryEvents);
  }

  private shouldMockGlofasStations(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Floods;
  }

  private shouldMockAlertPerLeadTime(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Floods;
  }

  private shouldMockRasterFile(disasterType: DisasterType): boolean {
    return [
      DisasterType.Floods,
      DisasterType.Drought,
      DisasterType.FlashFloods,
    ].includes(disasterType);
  }

  private shouldMockExposedAssets(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.FlashFloods;
  }

  private async shouldMockRiverGaugeData(
    layers: LayerMetadataEntity[],
    scenarioName: string,
  ): Promise<boolean> {
    const hasRiverGaugeLayer = layers
      .map((layer) => layer.name)
      .includes(PointDataCategory.gauges);
    return hasRiverGaugeLayer && scenarioName !== FlashFloodsScenario.NoTrigger;
  }

  private shouldMockTyphoonTrack(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Typhoon;
  }

  public async mock(
    mockInput: MockDto,
    disasterType?: DisasterType,
    countryCodeISO3?: string,
    noNotifications = false,
  ) {
    const countryCodes = countryCodeISO3
      ? [countryCodeISO3]
      : process.env.COUNTRIES.split(',');

    for await (const countryCodeISO3 of countryCodes) {
      const country = await this.countryRepo.findOne({
        where: { countryCodeISO3 },
        relations: ['disasterTypes'],
      });
      const countryDisasterTypes = country.disasterTypes.map(
        (dt) => dt.disasterType,
      );
      if (disasterType && !countryDisasterTypes.includes(disasterType)) {
        this.logger.log(
          `Disaster type ${disasterType} not found for country ${countryCodeISO3}`,
        );
        continue;
      }

      const disasterTypes = disasterType
        ? [disasterType]
        : countryDisasterTypes;

      for await (const disasterType of disasterTypes) {
        await this.mockCountryDisasterTypeData(
          countryCodeISO3,
          mockInput.removeEvents,
          mockInput.date,
          mockInput.scenario,
          disasterType,
          false,
          noNotifications,
        );
      }
    }
  }
}
