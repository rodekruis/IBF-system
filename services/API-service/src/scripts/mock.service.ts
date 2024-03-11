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

class Scenario {
  scenarionName: string;
  defaultScenario?: boolean;
  events: { eventName: string; leadTime: LeadTime }[];
}

@Injectable()
export class MockService {
  constructor(
    private metadataService: MetadataService,
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private eventService: EventService,
  ) {}

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

    return scenarios.find(
      (scenario) => scenario.scenarionName === scenarioName,
    );
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

  getIndicatorPlaceCodes(
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

  public async mock(
    countryCodeISO3: string,
    disasterType: DisasterType,
    scenarioName: string,
    defaultScenario: boolean,
    date: Date,
  ) {
    const selectedCountry = countries.find((country): any => {
      if (countryCodeISO3 === country.countryCodeISO3) {
        return country;
      }
    });

    const scenario = await this.getScenario(
      disasterType,
      countryCodeISO3,
      scenarioName,
      defaultScenario,
    );

    const adminLevels = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).adminLevels;

    const indicators = await this.getIndicators(countryCodeISO3, disasterType);

    for (const event of scenario.events) {
      for (const indicator of indicators) {
        for (const adminLevel of adminLevels) {
          const exposurePlaceCodes = this.getIndicatorPlaceCodes(
            disasterType,
            countryCodeISO3,
            scenario.scenarionName,
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
            leadTime: event.leadTime as LeadTime,
            dynamicIndicator: indicator,
            adminLevel: adminLevel,
            disasterType: disasterType,
            eventName: event.eventName,
            date,
          });
          console.log('mock');
        }
      }

      const triggersPerLeadTime = this.getFile(
        `./src/scripts/mock-data/${disasterType}/${countryCodeISO3}/${scenario.scenarionName}/${event.eventName}/triggers-per-leadtime.json`,
      );
      await this.eventService.uploadTriggerPerLeadTime({
        countryCodeISO3: countryCodeISO3,
        triggersPerLeadTime,
        disasterType: DisasterType.Floods,
        eventName: event.eventName,
        date,
      });
    }
  }
}
