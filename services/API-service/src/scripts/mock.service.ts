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
import { GlofasStationService } from '../api/glofas-station/glofas-station.service';
import {
  MockEpidemicsScenario,
  MockFlashFloodsScenario,
  MockFloodsScenario,
} from './mock.controller';
import { In, Repository } from 'typeorm';
import { EventPlaceCodeEntity } from '../api/event/event-place-code.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAreaDynamicDataEntity } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { EapActionStatusEntity } from '../api/eap-actions/eap-action-status.entity';
import { TriggerPerLeadTime } from '../api/event/trigger-per-lead-time.entity';
import { AdminAreaService } from '../api/admin-area/admin-area.service';
import { MockHelperService } from './mock-helper.service';
import { DEBUG } from '../config';
import { GeoserverSyncService } from './geoserver-sync.service';

class Scenario {
  scenarioName: string;
  defaultScenario?: boolean;
  events: Event[];
}
class Event {
  eventName: string;
  leadTime: LeadTime;
}

@Injectable()
export class MockService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(TriggerPerLeadTime)
  private readonly triggerPerLeadTimeRepo: Repository<TriggerPerLeadTime>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepo: Repository<EapActionStatusEntity>;

  constructor(
    private metadataService: MetadataService,
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private eventService: EventService,
    private glofasStationService: GlofasStationService,
    private adminAreaService: AdminAreaService,
    private mockHelpService: MockHelperService,
    private geoServerSyncService: GeoserverSyncService,
  ) {}

  public async mock(
    mockBody:
      | MockFloodsScenario
      | MockEpidemicsScenario
      | MockFlashFloodsScenario,
    disasterType: DisasterType,
    useDefaultScenario: boolean,
  ) {
    if (mockBody.removeEvents) {
      await this.removeEvents(mockBody.countryCodeISO3, disasterType);
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
      useDefaultScenario,
    );

    const adminLevels = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).adminLevels;

    const indicators = await this.getIndicators(
      mockBody.countryCodeISO3,
      disasterType,
    );

    if (!scenario.events) {
      const adminAreas = await this.adminAreaService.getAdminAreasRaw(
        selectedCountry.countryCodeISO3,
      );
      const leadTimesForNoTrigger = this.getLeadTimesForNoTrigger(
        disasterType,
        selectedCountry,
      );
      for (const indicator of indicators) {
        for (const adminLevel of adminLevels) {
          const exposurePlaceCodes = adminAreas
            .filter((area) => area.adminLevel === adminLevel)
            .map((area) => ({ placeCode: area.placeCode, amount: 0 }));
          for (const leadTime of leadTimesForNoTrigger) {
            await this.adminAreaDynamicDataService.exposure({
              countryCodeISO3: mockBody.countryCodeISO3,
              exposurePlaceCodes: exposurePlaceCodes,
              leadTime: leadTime as LeadTime,
              dynamicIndicator: indicator,
              adminLevel: adminLevel,
              disasterType: disasterType,
              eventName: null,
              date: mockBody.date,
            });
          }
        }
      }
    } else {
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
              countryCodeISO3: selectedCountry.countryCodeISO3,
              exposurePlaceCodes: exposurePlaceCodes,
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

        if (this.shouldMockTyphoonTrack(disasterType)) {
          console.log('mockTyphoonTrack not implemented yet');
          // await this.mockTyphoonTrack()
        }

        if (
          this.shouldMockMapImageFile(disasterType, mockBody.countryCodeISO3)
        ) {
          this.mockHelpService.mockMapImageFile(
            mockBody.countryCodeISO3,
            disasterType,
            true,
            event.eventName,
          );
        }

        if (this.shouldMockGlofasStations(disasterType)) {
          await this.mockGlofasStations(
            selectedCountry,
            DisasterType.Floods,
            mockBody.date,
            mockBody.scenario,
            event,
          );
        }

        if (this.shouldMockRasterFile(disasterType)) {
          // NOTE: in the floods-pipeline this should not happen per event, but per leadTime. So flood extents will be aggregated per leadTime after the event-loop. For mock-purposes this does not matter enough to change. For other disaster-types not sure also, so leaving like this.
          this.mockHelpService.mockRasterFile(
            selectedCountry,
            disasterType,
            true,
          );
        }
      }
    }

    if (this.shouldMockGlofasStations(disasterType)) {
      // This uploads all non-triggered stations outside of the event-loop
      await this.mockGlofasStations(
        selectedCountry,
        disasterType,
        mockBody.date,
        mockBody.scenario,
      );
    }

    if (this.shouldMockExposedAssets(disasterType)) {
      // TODO: the below methods still assume hard-coded leadTimes and is not flexible
      await this.mockHelpService.mockExposedAssets(
        selectedCountry.countryCodeISO3,
        !scenario.events, // no events means triggered=false
        mockBody.date,
      );
    }
    if (this.shouldMockDynamicPointData(disasterType)) {
      // TODO: the below methods still assume hard-coded leadTimes and is not flexible
      await this.mockHelpService.mockDynamicPointData(
        selectedCountry.countryCodeISO3,
        disasterType,
        mockBody.date,
      );
    }

    // Add the needed stores and layers to geoserver, only do this in debug mode
    // The resulting XML files should be commited to git and will end up on the servers that way
    if (DEBUG) {
      await this.geoServerSyncService.sync(
        selectedCountry.countryCodeISO3,
        disasterType,
      );
    }
  }

  private getLeadTimesForNoTrigger(
    disasterType: DisasterType,
    selectedCountry: any,
  ): LeadTime[] {
    // NOTE: this reflects agreements with pipelines that are in place. This is ugly, and should be refactored better.
    // When moving typhoon/droughts to this new mock-service, check well how this behaves / should be changed.
    if (disasterType === DisasterType.Floods) {
      return [LeadTime.day1];
    } else if (disasterType === DisasterType.FlashFloods) {
      return [LeadTime.hour1];
      // } else if (disasterType === DisasterType.Typhoon) {
      //   return [LeadTime.hour72];
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
  ) {
    const indicators =
      await this.metadataService.getIndicatorsByCountryAndDisaster(
        countryCodeISO3,
        disasterType,
      );
    const exposureUnits = indicators
      .filter((ind) => ind.dynamic)
      .map((ind) => ind.name as DynamicIndicator);

    // Make sure 'alert_threshold' is uploaded last
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
      leadTime = LeadTime.day7; // last available leadTime across all floods coutnries;
    }

    console.log(
      `Seeding Glofas stations for country: ${selectedCountry.countryCodeISO3} for leadtime: ${leadTime}`,
    );
    await this.glofasStationService.uploadTriggerDataPerStation({
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
    const countryAdminAreaIds = await this.eventService.getCountryAdminAreaIds(
      countryCodeISO3,
    );

    const allCountryEvents = await this.eventPlaceCodeRepo.find({
      relations: ['eapActionStatuses', 'adminArea'],
      where: {
        adminArea: In(countryAdminAreaIds),
        disasterType,
      },
    });
    await this.triggerPerLeadTimeRepo.delete({
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

  private shouldMockTriggerPerLeadTime(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Floods;
  }

  private shouldMockRasterFile(disasterType: DisasterType): boolean {
    return [
      DisasterType.Floods,
      DisasterType.HeavyRain,
      DisasterType.Drought,
      DisasterType.FlashFloods,
    ].includes(disasterType);
  }

  private shouldMockExposedAssets(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.FlashFloods;
  }

  private shouldMockDynamicPointData(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.FlashFloods;
  }

  private shouldMockTyphoonTrack(disasterType: DisasterType): boolean {
    return disasterType === DisasterType.Typhoon;
  }

  private shouldMockMapImageFile(
    disasterType: DisasterType,
    countryCodeISO3: string,
  ): boolean {
    return disasterType === DisasterType.Floods && countryCodeISO3 === 'SSD';
  }
}