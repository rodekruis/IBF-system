import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { GlofasStationService } from '../api/glofas-station/glofas-station.service';
import {
  MockAll,
  MockDynamic,
  MockTyphoonScenario,
  TyphoonScenario,
} from './scripts.controller';
import countries from './json/countries.json';
import fs from 'fs';
import { DynamicIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-data-unit';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { EventService } from '../api/event/event.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EventPlaceCodeEntity } from '../api/event/event-place-code.entity';
import { In, Repository } from 'typeorm';
import { EapActionStatusEntity } from '../api/eap-actions/eap-action-status.entity';
import { CountryEntity } from '../api/country/country.entity';
import { TyphoonTrackService } from '../api/typhoon-track/typhoon-track.service';
import { MetadataService } from '../api/metadata/metadata.service';
import { AdminLevel } from '../api/country/admin-level.enum';
import { TriggerPerLeadTime } from '../api/event/trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';
import { MockHelperService } from './mock-helper.service';
import { MockService } from './mock.service';

@Injectable()
export class ScriptsService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(TriggerPerLeadTime)
  private readonly triggerPerLeadTimeRepo: Repository<TriggerPerLeadTime>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepo: Repository<AdminAreaEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepo: Repository<EapActionStatusEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepo: Repository<CountryEntity>;

  private rainMonthsKey = 'rainMonths';
  private nationalDroughtRegion = 'National';

  public constructor(
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private glofasStationService: GlofasStationService,
    private typhoonTrackService: TyphoonTrackService,
    private eventService: EventService,
    private metadataService: MetadataService,
    private mockHelperService: MockHelperService,
    private mockService: MockService,
  ) {}

  public async mockAll(mockAllInput: MockAll) {
    const envCountries = process.env.COUNTRIES.split(',');

    const newMockServiceDisasterTypes = [
      DisasterType.Floods,
      DisasterType.Dengue,
      DisasterType.Malaria,
      DisasterType.FlashFloods,
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
        // this split makes sure that for drought all eventNames are removed
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

    const selectedCountry = countries.find((country): any => {
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

    if (
      [DisasterType.HeavyRain, DisasterType.Drought].includes(
        mockInput.disasterType,
      )
    ) {
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
  }

  public async mockTyphoonScenario(mockTyphoonScenario: MockTyphoonScenario) {
    if (
      [
        TyphoonScenario.EventTrigger,
        TyphoonScenario.EventAfterLandfall,
        TyphoonScenario.EventNoLandfall,
        TyphoonScenario.EventNoLandfallYet,
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
      [TyphoonScenario.EventNoTrigger, TyphoonScenario.NoEvent].includes(
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
      mockTyphoonScenario.scenario === TyphoonScenario.EventAfterLandfall
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
        TyphoonScenario.EventAfterLandfall,
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

        // For every drought-region (returns 1 empty array-element if not drought)
        for (const eventRegion of this.getEventRegions(
          disasterType,
          selectedCountry,
          triggered,
        )) {
          // For every lead-time .. (repeat the same data for every lead-time)
          for (const activeLeadTime of this.getLeadTimes(
            selectedCountry,
            disasterType,
            eventNr,
            typhoonScenario,
            date,
            eventRegion,
            triggered,
          )) {
            const eventName = this.getEventName(
              disasterType,
              eventNr,
              typhoonScenario,
              eventRegion,
              activeLeadTime,
              selectedCountry,
              date,
              triggered,
            );
            // Upload mock exposure data
            console.log(
              `Seeding exposure for country: ${selectedCountry.countryCodeISO3} for disasterType: ${disasterType} for adminLevel: ${adminLevel} for leadtime: ${activeLeadTime} for unit: ${unit} for eventName: ${eventName} `,
            );
            await this.adminAreaDynamicDataService.exposure({
              countryCodeISO3: selectedCountry.countryCodeISO3,
              exposurePlaceCodes: await this.mockAmount(
                exposure,
                unit,
                triggered,
                disasterType,
                selectedCountry,
                activeLeadTime,
                date,
                eventRegion,
              ),
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
      if (typhoonScenario === TyphoonScenario.NoEvent) {
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
    if (typhoonScenario === TyphoonScenario.EventNoTrigger) {
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
    selectedCountry: any,
    disasterType: DisasterType,
    eventNr: number,
    typhoonScenario: TyphoonScenario,
    date: Date,
    droughtRegion: string,
    triggered: boolean,
  ) {
    const leadTimes = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).activeLeadTimes;
    return leadTimes.filter((leadTime) =>
      this.filterLeadTimesPerDisasterType(
        selectedCountry,
        leadTime,
        disasterType,
        eventNr,
        date,
        droughtRegion,
        triggered,
        typhoonScenario,
      ),
    );
  }

  private getEventRegions(
    disasterType: DisasterType,
    selectedCountry,
    triggered,
  ): string[] {
    if (triggered) {
      if (disasterType === DisasterType.Drought) {
        const regions = Object.keys(
          selectedCountry.countryDisasterSettings.find(
            (s) => s.disasterType === disasterType,
          ).droughtForecastSeasons,
        );
        return regions;
      }
    }
    return [null];
  }

  private getEventName(
    disasterType: DisasterType,
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
    eventRegion?: string,
    leadTime?: LeadTime,
    selectedCountry?: any,
    date?: Date,
    triggered?: boolean,
  ): string {
    if (disasterType === DisasterType.Typhoon) {
      if (typhoonScenario === TyphoonScenario.NoEvent) {
        return null;
      } else {
        return `Mock typhoon ${eventNr}`;
      }
    } else if (
      disasterType === DisasterType.Drought &&
      // eventRegion !== this.nationaleventRegion &&
      ['UGA', 'ETH', 'KEN'].includes(selectedCountry.countryCodeISO3) && // exclude ZWE for now this way
      triggered
    ) {
      const seasons = selectedCountry.countryDisasterSettings.find(
        (s) => s.disasterType === DisasterType.Drought,
      ).droughtForecastSeasons[eventRegion];
      const leadTimeMonthFirstDay = this.getCurrentMonthInfoDrought(
        leadTime,
        date,
        selectedCountry,
      ).leadTimeMonthFirstDay;

      for (const seasonKey of Object.keys(seasons)) {
        for (const month of seasons[seasonKey][this.rainMonthsKey]) {
          if (month === leadTimeMonthFirstDay.getMonth() + 1) {
            return `${seasonKey}_${eventRegion}`;
          }
        }
      }
    } else {
      return null;
    }
  }

  private filterLeadTimesPerDisasterType(
    selectedCountry: any,
    leadTime: string,
    disasterType: DisasterType,
    eventNr = 1,
    date: Date,
    eventRegion: string,
    triggered: boolean,
    typhoonScenario?: TyphoonScenario,
  ) {
    if (disasterType === DisasterType.Drought) {
      return this.getDroughtLeadTime(
        selectedCountry,
        leadTime,
        disasterType,
        date,
        eventRegion,
        triggered,
      );
    } else if (disasterType === DisasterType.Typhoon) {
      return leadTime === this.getTyphoonLeadTime(eventNr, typhoonScenario);
    } else {
      return true;
    }
  }

  private getCurrentMonthInfoDrought(
    leadTime: LeadTime,
    date: Date,
    selectedCountry,
  ) {
    const now = date || new Date();
    let currentMonthFirstDay: Date;
    currentMonthFirstDay = new Date(now.getFullYear(), now.getUTCMonth(), 1);

    const endOfMonthPipeline = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === DisasterType.Drought,
    ).droughtEndOfMonthPipeline;
    if (endOfMonthPipeline) {
      currentMonthFirstDay = new Date(
        currentMonthFirstDay.setMonth(currentMonthFirstDay.getMonth() + 1),
      );
    }
    const currentYear = currentMonthFirstDay.getFullYear();
    const currentUTCMonth = currentMonthFirstDay.getUTCMonth();

    const leadTimeMonthFirstDay = new Date(
      currentMonthFirstDay.setUTCMonth(
        currentUTCMonth + Number(leadTime.split('-')[0]),
      ),
    );
    return {
      currentYear,
      currentUTCMonth,
      leadTimeMonthFirstDay,
    };
  }

  private getDroughtLeadTime(
    selectedCountry: any,
    leadTime: string,
    disasterType: DisasterType,
    date: Date,
    droughtRegion: string,
    triggered: boolean,
  ): boolean {
    const forecastSeasonAreas = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).droughtForecastSeasons;

    let useLeadTimeForMock = false;
    for (const area of Object.keys(forecastSeasonAreas)) {
      if (area === droughtRegion || !triggered) {
        useLeadTimeForMock = this.useLeadTimeForMock(
          forecastSeasonAreas[area],
          leadTime,
          date,
          selectedCountry,
        );
        if (useLeadTimeForMock) break;
      }
    }
    return useLeadTimeForMock;
  }

  private useLeadTimeForMock(
    forecastSeasons,
    leadTime: string,
    date: Date,
    selectedCountry: any,
  ) {
    const { currentYear, currentUTCMonth, leadTimeMonthFirstDay } =
      this.getCurrentMonthInfoDrought(
        leadTime as LeadTime,
        date,
        selectedCountry,
      );

    // If current month is one of the months in the seasons, always use '0-month' and return early ..
    if (leadTime === LeadTime.month0) {
      for (const season of Object.values(forecastSeasons)) {
        for (const month of season[this.rainMonthsKey]) {
          if (currentUTCMonth + 1 === month) {
            return true;
          }
        }
      }
    }

    // .. For other cases, continue to find the next forecast month
    const forecastMonthNumbers = Object.values(forecastSeasons).map(
      (season) => season[this.rainMonthsKey][0],
    );
    let forecastMonthNumber: number;
    forecastMonthNumbers
      .sort((a, b) => (a > b ? -1 : 1))
      .forEach((month) => {
        if (currentUTCMonth + 1 < month) {
          // add 1 because 'currentUTCmonth' starts at 0, while 'month' does not
          forecastMonthNumber = month;
        }
      });
    if (!forecastMonthNumber) {
      forecastMonthNumber =
        forecastMonthNumbers[forecastMonthNumbers.length - 1];
    }

    const nextForecastMonthYear =
      currentUTCMonth >= forecastMonthNumber ? currentYear + 1 : currentYear;
    const nextForecastMonthFirstDay = new Date(
      nextForecastMonthYear,
      forecastMonthNumber - 1,
      1,
    );
    return (
      nextForecastMonthFirstDay.getTime() === leadTimeMonthFirstDay.getTime()
    );
  }

  private getTyphoonLeadTime(
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ): string {
    if (typhoonScenario === TyphoonScenario.EventAfterLandfall) {
      return LeadTime.hour0;
    } else if (typhoonScenario === TyphoonScenario.NoEvent) {
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
    exposurePlacecodes: any,
    exposureUnit: DynamicIndicator,
    triggered: boolean,
    disasterType: DisasterType,
    selectedCountry,
    activeLeadTime: LeadTime,
    date: Date,
    eventRegion?: string,
  ): Promise<any[]> {
    let copyOfExposureUnit = JSON.parse(JSON.stringify(exposurePlacecodes));
    if (
      disasterType === DisasterType.Drought &&
      selectedCountry.countryCodeISO3 !== 'ZWE' && // exclude ZWE drought from this rule
      triggered
    ) {
      if (Number(activeLeadTime.split('-')[0]) > 3) {
        copyOfExposureUnit.forEach((area) => (area.amount = 0));
        // Hard-code lead-times of more then 3 months to non-trigger
      } else if (eventRegion !== this.nationalDroughtRegion) {
        // Hard-code that only areas of right region are triggered per selected leadtime
        const areas = this.getDroughtAreasPerRegion(
          selectedCountry,
          disasterType,
          activeLeadTime,
          date,
          eventRegion,
        );
        const amountFactor =
          exposureUnit === DynamicIndicator.alertThreshold
            ? 1
            : exposureUnit === DynamicIndicator.populationAffected
            ? 1000
            : null;
        copyOfExposureUnit = areas.map((area) => {
          return {
            placeCode: area.placeCode,
            amount: area.triggered ? amountFactor : 0,
          };
        });
      }
    }
    return copyOfExposureUnit;
  }

  private getDroughtAreasPerRegion(
    selectedCountry,
    disasterType: DisasterType,
    leadTime: LeadTime,
    date: Date,
    droughtRegion: string,
  ): { placeCode: string; triggered: boolean }[] {
    const forecastSeasonData = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    );
    const forecastSeasonAreas = forecastSeasonData.droughtForecastSeasons;
    const droughtRegionAreas = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).droughtAreas;

    const { currentUTCMonth, leadTimeMonthFirstDay } =
      this.getCurrentMonthInfoDrought(
        leadTime as LeadTime,
        date,
        selectedCountry,
      );
    const month = leadTimeMonthFirstDay.getMonth() + 1;

    const triggeredAreas = droughtRegionAreas[droughtRegion].map(
      (placeCode) => {
        return { placeCode: placeCode, triggered: false };
      },
    );
    for (const season of Object.values(forecastSeasonAreas[droughtRegion])) {
      const filteredSeason = season[this.rainMonthsKey].filter(
        (seasonMonth) => seasonMonth >= currentUTCMonth + 1,
      );
      if (filteredSeason[0] === month) {
        let placeCodes = [];
        switch (selectedCountry.countryCodeISO3) {
          case 'ETH':
            if (droughtRegion === 'Belg') {
              placeCodes = ['ET0721'];
            } else if (droughtRegion === 'Meher') {
              placeCodes = ['ET0101'];
            } else if (droughtRegion === 'Northern') {
              placeCodes = ['ET0201'];
            } else if (droughtRegion === 'Southern') {
              placeCodes = ['ET0508'];
            }
            break;
          case 'UGA':
            if (droughtRegion === 'Central') {
              placeCodes = ['21UGA004001', '21UGA004002'];
            } else if (droughtRegion === 'Karamoja') {
              placeCodes = ['21UGA008003', '21UGA008004'];
            }
            break;
          default:
        }

        triggeredAreas
          .filter((a) => placeCodes.includes(a.placeCode))
          .forEach((a) => (a.triggered = true));
      }
    }
    return triggeredAreas;
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
    if (typhoonScenario === TyphoonScenario.EventNoLandfall) {
      trackFileName = `${filePath}/typhoon-track-${selectedCountry.countryCodeISO3}-no-landfall.json`;
    } else if (typhoonScenario === TyphoonScenario.EventNoLandfallYet) {
      trackFileName = `${filePath}/typhoon-track-${selectedCountry.countryCodeISO3}-no-landfall-yet.json`;
    }

    const trackRaw = fs.readFileSync(trackFileName, 'utf-8');
    const track = JSON.parse(trackRaw);

    // Overwrite timestamps of trackpoints to align with today's date
    // Make sure that the moment of landfall lies just ahead
    let i = typhoonScenario === TyphoonScenario.EventAfterLandfall ? -29 : -23;
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
        typhoonScenario === TyphoonScenario.NoEvent ? [] : track,
      date,
    });
  }
}
