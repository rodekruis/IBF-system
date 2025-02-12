import fs from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { AdminAreaDynamicDataEntity } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { DynamicIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-data-unit';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { AdminAreaService } from '../api/admin-area/admin-area.service';
import { AdminLevel } from '../api/country/admin-level.enum';
import { CountryEntity } from '../api/country/country.entity';
import { CountryDisasterSettingsDto } from '../api/country/dto/add-countries.dto';
import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { EapActionStatusEntity } from '../api/eap-actions/eap-action-status.entity';
import { AlertPerLeadTimeEntity } from '../api/event/alert-per-lead-time.entity';
import { EventPlaceCodeEntity } from '../api/event/event-place-code.entity';
import { EventService } from '../api/event/event.service';
import { MetadataService } from '../api/metadata/metadata.service';
import { PointDataService } from '../api/point-data/point-data.service';
import { TyphoonTrackService } from '../api/typhoon-track/typhoon-track.service';
import { DEBUG } from '../config';
import { MockInputDto } from './dto/mock-input.dto';
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
    private pointDataService: PointDataService,
    private adminAreaService: AdminAreaService,
    private typhoonTrackService: TyphoonTrackService,
    private mockHelpService: MockHelperService,
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
    isApiTest: boolean,
  ) {
    if (removeEvents) {
      await this.removeEvents(countryCodeISO3, disasterType);
    }
    date = date || new Date();

    const selectedCountry = countries.find((country) => {
      if (countryCodeISO3 === country.countryCodeISO3) {
        return country;
      }
    }) as Country;

    const scenario = await this.getScenario(
      disasterType,
      countryCodeISO3,
      scenarioName,
      useDefaultScenario,
    );
    if (!scenario) {
      console.log(
        `Scenario ${scenarioName} not found for country ${countryCodeISO3} and disasterType ${disasterType}`,
      );
      return;
    }

    const disasterSettings: CountryDisasterSettingsDto[] | undefined =
      selectedCountry.countryDisasterSettings;
    if (!disasterSettings) {
      console.error('Disaster settings not found for country.');
    }
    const adminLevels = disasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).adminLevels;

    const indicators = await this.getIndicators(
      countryCodeISO3,
      disasterType,
      scenario.scenarioName,
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
        const leadTime = this.mockHelpService.getLeadTime(
          disasterType,
          selectedCountry,
          event.eventName,
          event.leadTime,
          date,
        );

        if (this.mockHelpService.skipLeadTime(disasterType, leadTime)) {
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
              console.error('NO FILE!!!', indicator);
              continue;
            }

            await this.adminAreaDynamicDataService.exposure({
              countryCodeISO3: countryCodeISO3,
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
          const alertsPerLeadTime = this.getFile(
            `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenario.scenarioName}/${event.eventName}/alerts-per-leadtime.json`,
          );

          await this.eventService.uploadAlertPerLeadTime({
            countryCodeISO3,
            triggersPerLeadTime: alertsPerLeadTime, //##TODO: change to alertsPerLeadTime
            disasterType: DisasterType.Floods,
            eventName: event.eventName,
            date,
          });
        }

        if (this.shouldMockTyphoonTrack(disasterType)) {
          await this.mockHelpService.mockTyphoonTrack(
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
          await this.mockHelpService.mockExposedAssets(
            selectedCountry.countryCodeISO3,
            date,
            scenario.scenarioName,
            event,
          );
        }
      }
    }

    if (this.shouldMockRasterFile(disasterType)) {
      this.mockHelpService.mockRasterFile(
        selectedCountry,
        disasterType,
        !scenario.events,
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

    if (this.shouldMockDynamicPointData(disasterType, scenario.scenarioName)) {
      await this.mockHelpService.mockDynamicPointData(
        selectedCountry.countryCodeISO3,
        disasterType,
        scenario.scenarioName,
        date,
      );
    }

    // Close finished events (only relevant for follow-up mock pipeline runs, with removeEvents=false)
    await this.eventService.closeEventsAutomatic(
      selectedCountry.countryCodeISO3,
      disasterType,
    );

    // Add the needed stores and layers to geoserver, only do this in debug mode
    // The resulting XML files should be commited to git and will end up on the servers that way
    if (DEBUG && !isApiTest) {
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
    const leadTimesForNoTrigger = this.getLeadTimesNoEvents(
      disasterType,
      selectedCountry,
      date,
    );
    for (const indicator of indicators) {
      for (const adminLevel of adminLevels) {
        const exposurePlaceCodes = adminAreas
          .filter((area) => area.adminLevel === adminLevel)
          .map((area) => ({ placeCode: area.placeCode, amount: 0 }));
        for (const leadTime of leadTimesForNoTrigger) {
          await this.adminAreaDynamicDataService.exposure({
            countryCodeISO3: selectedCountry.countryCodeISO3,
            exposurePlaceCodes: exposurePlaceCodes,
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
        leadTime: leadTimesForNoTrigger[0] as LeadTime,
        eventName: null,
        trackpointDetails: [],
        date,
      });
    }
  }

  private getLeadTimesNoEvents(
    disasterType: DisasterType,
    selectedCountry: Country,
    date: Date,
  ): LeadTime[] {
    // NOTE: this reflects agreements with pipelines that are in place. This is ugly, and should be refactored better.
    // When moving typhoon/droughts to this new mock-service, check well how this behaves / should be changed.
    if (disasterType === DisasterType.Floods) {
      return [LeadTime.day1];
    } else if (disasterType === DisasterType.FlashFloods) {
      return [LeadTime.hour1];
    } else if (disasterType === DisasterType.Drought) {
      const leadTime = this.mockHelpService.getLeadTimeDroughtNoEvents(
        selectedCountry,
        date,
      );
      return [leadTime];
    } else if (disasterType === DisasterType.Typhoon) {
      return [LeadTime.hour72];
    } else {
      return selectedCountry.countryDisasterSettings.find(
        (settings) => settings.disasterType === disasterType,
      ).activeLeadTimes;
    }
  }

  private async getScenario(
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
    scenarioName: string,
  ) {
    const indicators =
      await this.metadataService.getIndicatorsByCountryAndDisaster(
        countryCodeISO3,
        disasterType,
      );
    let dynamicIndicators = indicators
      .filter((ind) => ind.dynamic)
      .map((ind) => ind.name as DynamicIndicator);

    if (disasterType === DisasterType.Typhoon) {
      dynamicIndicators.push(DynamicIndicator.showAdminArea);
      // is this needed?
      if (scenarioName === TyphoonScenario.NoTrigger) {
        dynamicIndicators = [
          DynamicIndicator.housesAffected,
          DynamicIndicator.alertThreshold,
        ];
      }
    }

    // Make sure 'alert_threshold' is uploaded last
    return dynamicIndicators.sort((a, _b) =>
      a === DynamicIndicator.alertThreshold ? 1 : -1,
    );
  }

  private getMockExposureData(
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
    date: Date,
    scenarioName: string,
    event?: Event,
  ) {
    let stationForecasts;
    let leadTime;
    if (event) {
      stationForecasts = this.getFile(
        `./src/scripts/mock-data/${disasterType}/${selectedCountry.countryCodeISO3}/${scenarioName}/${event.eventName}/glofas-station.json`,
      );
      leadTime = event.leadTime;
    } else {
      stationForecasts = this.getFile(
        `./src/scripts/mock-data/${disasterType}/${selectedCountry.countryCodeISO3}/${scenarioName}/glofas-stations-no-trigger.json`,
      );
      leadTime = LeadTime.day7; // last available leadTime across all floods countries;
    }

    console.log(
      `Seeding Glofas stations for country: ${selectedCountry.countryCodeISO3} for leadtime: ${leadTime}`,
    );
    await this.pointDataService.reformatAndUploadOldGlofasStationData({
      countryCodeISO3: selectedCountry.countryCodeISO3,
      stationForecasts,
      leadTime,
      date,
    });
  }

  private async removeEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    const countryAdminAreaIds =
      await this.eventService.getCountryAdminAreaIds(countryCodeISO3);

    const allCountryEvents = await this.eventPlaceCodeRepo.find({
      relations: ['eapActionStatuses', 'adminArea'],
      where: {
        adminArea: In(countryAdminAreaIds),
        disasterType,
      },
    });
    await this.alertPerLeadTimeRepo.delete({
      countryCodeISO3,
      disasterType,
    });
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

  private shouldMockDynamicPointData(
    disasterType: DisasterType,
    scenarioName: string,
  ): boolean {
    return (
      disasterType === DisasterType.FlashFloods &&
      scenarioName !== FlashFloodsScenario.NoTrigger
    );
  }

  private shouldMockTyphoonTrack(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Typhoon;
  }

  public async mock(
    mockInput: MockInputDto,
    disasterType?: DisasterType,
    countryCodeISO3?: string,
    isApiTest = false,
  ) {
    const countryCodes = countryCodeISO3
      ? [countryCodeISO3]
      : process.env.COUNTRIES.split(',');

    for await (const countryCodeISO3 of countryCodes) {
      const country = await this.countryRepo.findOne({
        where: { countryCodeISO3: countryCodeISO3 },
        relations: ['disasterTypes'],
      });
      const countryDisasterTypes = country.disasterTypes.map(
        (dt) => dt.disasterType,
      );
      if (disasterType && !countryDisasterTypes.includes(disasterType)) {
        console.log(
          `Provided disaster type ${disasterType} not found for country ${countryCodeISO3}`,
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
          isApiTest,
        );
      }
    }
  }
}
