import fs from 'fs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { AdminAreaDynamicDataEntity } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { DynamicIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-data-unit';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { AdminLevel } from '../api/country/admin-level.enum';
import { CountryEntity } from '../api/country/country.entity';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { EapActionStatusEntity } from '../api/eap-actions/eap-action-status.entity';
import { EventPlaceCodeEntity } from '../api/event/event-place-code.entity';
import { EventService } from '../api/event/event.service';
import { TriggerPerLeadTime } from '../api/event/trigger-per-lead-time.entity';
import { MetadataService } from '../api/metadata/metadata.service';
import { TyphoonTrackService } from '../api/typhoon-track/typhoon-track.service';
import { TyphoonScenario } from './enum/mock-scenario.enum';
import countries from './json/countries.json';
import { MockHelperService } from './mock-helper.service';
import { MockService } from './mock.service';
import {
  MockAll,
  MockDynamic,
  MockTyphoonScenario,
} from './scripts.controller';

@Injectable()
export class ScriptsService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(TriggerPerLeadTime)
  private readonly triggerPerLeadTimeRepo: Repository<TriggerPerLeadTime>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepo: Repository<EapActionStatusEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepo: Repository<CountryEntity>;

  public constructor(
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private typhoonTrackService: TyphoonTrackService,
    private eventService: EventService,
    private metadataService: MetadataService,
    private mockHelperService: MockHelperService,
    private mockService: MockService,
  ) {}

  public async mockAll(mockAllInput: MockAll) {
    const isApiTest = false;

    const envCountries = process.env.COUNTRIES.split(',');

    const newMockServiceDisasterTypes = [
      DisasterType.Floods,
      DisasterType.Malaria,
      DisasterType.FlashFloods,
      DisasterType.Drought,
    ];

    for await (const countryCodeISO3 of envCountries) {
      const country = await this.countryRepo.findOne({
        where: { countryCodeISO3: countryCodeISO3 },
        relations: ['disasterTypes'],
      });

      for await (const disasterType of country.disasterTypes) {
        if (newMockServiceDisasterTypes.includes(disasterType.disasterType)) {
          await this.mockService.mock(
            {
              secret: mockAllInput.secret,
              countryCodeISO3,
              removeEvents: true,
              date: mockAllInput.date || new Date(),
              scenario: null, // This is overwritten by useDefaultScenario=true anyway
            },
            disasterType.disasterType,
            true,
            isApiTest,
          );
        } else {
          await this.mockCountry({
            secret: mockAllInput.secret,
            countryCodeISO3,
            disasterType: disasterType.disasterType,
            triggered: mockAllInput.triggered,
            removeEvents: true,
            date: mockAllInput.date || new Date(),
          });
        }
      }
    }
  }

  public async mockCountry(
    mockInput: MockDynamic,
    eventNr?: number,
    typhoonScenario?: TyphoonScenario,
  ) {
    eventNr = eventNr || 1;

    if (mockInput.removeEvents) {
      const countryAdminAreaIds =
        await this.eventService.getCountryAdminAreaIds(
          mockInput.countryCodeISO3,
        );
      let allCountryEvents;
      if (mockInput.disasterType === DisasterType.Typhoon) {
        allCountryEvents = await this.eventPlaceCodeRepo.find({
          relations: ['eapActionStatuses', 'adminArea'],
          where: {
            adminArea: In(countryAdminAreaIds),
            disasterType: mockInput.disasterType,
            eventName: this.getEventName(mockInput.disasterType, eventNr),
          },
        });
        await this.triggerPerLeadTimeRepo.delete({
          countryCodeISO3: mockInput.countryCodeISO3,
          disasterType: mockInput.disasterType,
          eventName: this.getEventName(mockInput.disasterType, eventNr),
        });
        await this.adminAreaDynamicDataRepo.delete({
          countryCodeISO3: mockInput.countryCodeISO3,
          disasterType: mockInput.disasterType,
          eventName: this.getEventName(mockInput.disasterType, eventNr),
        });
      } else {
        allCountryEvents = await this.eventPlaceCodeRepo.find({
          relations: ['eapActionStatuses', 'adminArea'],
          where: {
            adminArea: In(countryAdminAreaIds),
            disasterType: mockInput.disasterType,
          },
        });
        await this.triggerPerLeadTimeRepo.delete({
          countryCodeISO3: mockInput.countryCodeISO3,
          disasterType: mockInput.disasterType,
        });
        await this.adminAreaDynamicDataRepo.delete({
          countryCodeISO3: mockInput.countryCodeISO3,
          disasterType: mockInput.disasterType,
        });
      }

      for (const event of allCountryEvents) {
        await this.eapActionStatusRepo.remove(event.eapActionStatuses);
      }
      await this.eventPlaceCodeRepo.remove(allCountryEvents);
    }

    const selectedCountry = countries.find((country) => {
      if (mockInput.countryCodeISO3 === country.countryCodeISO3) {
        return country;
      }
    });

    const date = mockInput.date ? new Date(mockInput.date) : new Date();

    await this.mockExposure(
      selectedCountry,
      mockInput.disasterType,
      mockInput.triggered,
      eventNr,
      date,
      typhoonScenario,
    );

    if ([DisasterType.HeavyRain].includes(mockInput.disasterType)) {
      await this.mockHelperService.mockRasterFile(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
      );
    }

    if (mockInput.disasterType === DisasterType.Typhoon) {
      await this.mockTyphoonTrack(
        selectedCountry,
        typhoonScenario,
        eventNr,
        date,
      );
    }

    // Close finished events (only applicable for follow-up mock pipeline runs, with removeEvents=false)
    await this.eventService.closeEventsAutomatic(
      selectedCountry.countryCodeISO3,
      mockInput.disasterType,
    );
  }

  public async mockTyphoonScenario(mockTyphoonScenario: MockTyphoonScenario) {
    if (
      [
        TyphoonScenario.Trigger,
        TyphoonScenario.OngoingTrigger,
        TyphoonScenario.NoLandfallTrigger,
        TyphoonScenario.NoLandfallYetWarning,
      ].includes(mockTyphoonScenario.scenario)
    ) {
      // Scenario 'eventTrigger' is equal to using the normal mock-endpoint for typhoon with 'triggered = true'
      await this.mockCountry(
        {
          countryCodeISO3: mockTyphoonScenario.countryCodeISO3,
          disasterType: DisasterType.Typhoon,
          triggered: true,
          removeEvents: mockTyphoonScenario.removeEvents,
          secret: mockTyphoonScenario.secret,
          date: mockTyphoonScenario.date || new Date(),
        },
        mockTyphoonScenario.eventNr,
        mockTyphoonScenario.scenario,
      );
    } else if (
      [TyphoonScenario.Warning, TyphoonScenario.NoTrigger].includes(
        mockTyphoonScenario.scenario,
      )
    ) {
      await this.mockCountry(
        {
          countryCodeISO3: mockTyphoonScenario.countryCodeISO3,
          disasterType: DisasterType.Typhoon,
          triggered: false,
          removeEvents: mockTyphoonScenario.removeEvents,
          secret: mockTyphoonScenario.secret,
          date: mockTyphoonScenario.date || new Date(),
        },
        mockTyphoonScenario.eventNr,
        mockTyphoonScenario.scenario,
      );
    } else if (
      mockTyphoonScenario.scenario === TyphoonScenario.OngoingTrigger
    ) {
      await this.mockCountry(
        {
          countryCodeISO3: mockTyphoonScenario.countryCodeISO3,
          disasterType: DisasterType.Typhoon,
          triggered: true,
          removeEvents: mockTyphoonScenario.removeEvents,
          secret: mockTyphoonScenario.secret,
          date: mockTyphoonScenario.date || new Date(),
        },
        mockTyphoonScenario.eventNr,
        TyphoonScenario.OngoingTrigger,
      );
    } else {
      throw new HttpException('Not a known scenario', HttpStatus.BAD_REQUEST);
    }
  }

  private async mockExposure(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
    eventNr = 1,
    date: Date,
    typhoonScenario?: TyphoonScenario,
  ) {
    // Define indicators to upload ..
    const exposureUnits = await this.getIndicators(
      selectedCountry.countryCodeISO3,
      disasterType,
      typhoonScenario,
    );

    // For every indicator ..
    for (const unit of exposureUnits) {
      // For every admin-level ..
      for (const adminLevel of selectedCountry.countryDisasterSettings.find(
        (s) => s.disasterType === disasterType,
      ).adminLevels) {
        // Get the right mock-data-file
        const exposure = await this.getMockData(
          unit,
          adminLevel,
          eventNr,
          selectedCountry.countryCodeISO3,
          disasterType,
          triggered,
          typhoonScenario,
        );

        // For every lead-time .. (repeat the same data for every lead-time)
        for (const activeLeadTime of this.getLeadTimes(
          selectedCountry,
          disasterType,
          eventNr,
          typhoonScenario,
        )) {
          const eventName = this.getEventName(
            disasterType,
            eventNr,
            typhoonScenario,
          );
          // Upload mock exposure data
          console.log(
            `Seeding exposure for country: ${selectedCountry.countryCodeISO3} for disasterType: ${disasterType} for adminLevel: ${adminLevel} for leadtime: ${activeLeadTime} for unit: ${unit} for eventName: ${eventName} `,
          );
          await this.adminAreaDynamicDataService.exposure({
            countryCodeISO3: selectedCountry.countryCodeISO3,
            exposurePlaceCodes: await this.mockAmount(exposure),
            leadTime: activeLeadTime as LeadTime,
            dynamicIndicator: unit,
            adminLevel: adminLevel,
            disasterType: disasterType,
            eventName: eventName,
            date,
          });
        }
      }
    }
  }

  private async getIndicators(
    countryCodeISO3: string,
    disasterType: DisasterType,
    typhoonScenario: TyphoonScenario,
  ) {
    const indicators =
      await this.metadataService.getIndicatorsByCountryAndDisaster(
        countryCodeISO3,
        disasterType,
      );
    let exposureUnits = indicators
      .filter((ind) => ind.dynamic)
      .map((ind) => ind.name as DynamicIndicator);

    if (disasterType === DisasterType.Typhoon) {
      exposureUnits.push(DynamicIndicator.showAdminArea);
      if (typhoonScenario === TyphoonScenario.NoTrigger) {
        exposureUnits = [
          DynamicIndicator.housesAffected,
          DynamicIndicator.alertThreshold,
        ];
      }
    }
    // Make sure 'alert threshold' is uploaded last
    return exposureUnits.sort((a, _b) =>
      a === DynamicIndicator.alertThreshold ? 1 : -1,
    );
  }

  private getMockData(
    unit: DynamicIndicator,
    adminLevel: AdminLevel,
    eventNr: number,
    countryCodeISO3: string,
    disasterType: DisasterType,
    triggered = true,
    typhoonScenario?: TyphoonScenario,
  ) {
    let fileName = `upload-${unit}-${adminLevel}`;
    if (eventNr > 1) {
      fileName = `${fileName}-eventNr-2`;
    }
    const exposureFileName = `./src/api/admin-area-dynamic-data/dto/example/${countryCodeISO3}/${disasterType}/${fileName}.json`;
    const exposureRaw = fs.readFileSync(exposureFileName, 'utf-8');
    const exposure = JSON.parse(exposureRaw);

    // For typhoon event-no-trigger case, set only alert-threshold to 0
    if (typhoonScenario === TyphoonScenario.Warning) {
      if (unit === DynamicIndicator.alertThreshold) {
        exposure.forEach((area) => (area.amount = 0));
      }
      return exposure;
    }
    // If non-triggered, replace all values by 0
    if (!triggered && unit !== DynamicIndicator.potentialThreshold) {
      exposure.forEach((area) => (area.amount = 0));
    }
    return exposure;
  }

  private getLeadTimes(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedCountry: any,
    disasterType: DisasterType,
    eventNr: number,
    typhoonScenario: TyphoonScenario,
  ) {
    const leadTimes = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).activeLeadTimes;
    return leadTimes.filter((leadTime) =>
      this.filterLeadTimesPerDisasterType(
        leadTime,
        disasterType,
        eventNr,
        typhoonScenario,
      ),
    );
  }

  private getEventName(
    disasterType: DisasterType,
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ): string {
    if (disasterType === DisasterType.Typhoon) {
      if (typhoonScenario === TyphoonScenario.NoTrigger) {
        return null;
      } else {
        return `Mock typhoon ${eventNr}`;
      }
    } else {
      return null;
    }
  }

  private filterLeadTimesPerDisasterType(
    leadTime: string,
    disasterType: DisasterType,
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ) {
    if (disasterType === DisasterType.Typhoon) {
      return leadTime === this.getTyphoonLeadTime(eventNr, typhoonScenario);
    } else {
      return true;
    }
  }

  private getTyphoonLeadTime(
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ): string {
    if (typhoonScenario === TyphoonScenario.OngoingTrigger) {
      return LeadTime.hour0;
    } else if (typhoonScenario === TyphoonScenario.NoTrigger) {
      return LeadTime.hour72;
    } else if (eventNr === 1) {
      return LeadTime.hour48;
    } else if (eventNr === 2) {
      return LeadTime.hour114;
    } else {
      return `${114 + eventNr}-hour` as LeadTime;
    }
  }

  private async mockAmount(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exposurePlaceCodes: any,
  ) {
    const copyOfExposureUnit = JSON.parse(JSON.stringify(exposurePlaceCodes));
    return copyOfExposureUnit;
  }

  private async mockTyphoonTrack(
    selectedCountry,
    typhoonScenario: TyphoonScenario,
    eventNr = 1,
    date: Date,
  ) {
    const filePath = './src/api/typhoon-track/dto/example';
    let trackFileName = `${filePath}/typhoon-track-${
      selectedCountry.countryCodeISO3
    }${eventNr > 1 ? `-eventNr-2` : ''}.json`;
    if (typhoonScenario === TyphoonScenario.NoLandfallTrigger) {
      trackFileName = `${filePath}/typhoon-track-${selectedCountry.countryCodeISO3}-no-landfall.json`;
    } else if (typhoonScenario === TyphoonScenario.NoLandfallYetWarning) {
      trackFileName = `${filePath}/typhoon-track-${selectedCountry.countryCodeISO3}-no-landfall-yet.json`;
    }

    const trackRaw = fs.readFileSync(trackFileName, 'utf-8');
    const track = JSON.parse(trackRaw);

    // Overwrite timestamps of trackpoints to align with today's date
    // Make sure that the moment of landfall lies just ahead
    let i = typhoonScenario === TyphoonScenario.OngoingTrigger ? -29 : -23;
    for (const trackpoint of track) {
      const now = date || new Date();
      trackpoint.timestampOfTrackpoint = new Date(
        now.getTime() + i * (1000 * 60 * 60 * 6),
      );
      i += 1;
    }

    const mockLeadTime = this.getTyphoonLeadTime(eventNr, typhoonScenario);

    console.log(
      `Seeding Typhoon track for country: ${selectedCountry.countryCodeISO3} for leadtime: ${mockLeadTime} `,
    );
    await this.typhoonTrackService.uploadTyphoonTrack({
      countryCodeISO3: selectedCountry.countryCodeISO3,
      leadTime: mockLeadTime as LeadTime,
      eventName: this.getEventName(DisasterType.Typhoon, eventNr),
      trackpointDetails:
        typhoonScenario === TyphoonScenario.NoTrigger ? [] : track,
      date,
    });
  }
}
