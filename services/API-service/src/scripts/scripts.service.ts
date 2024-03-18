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
import { LinesDataService } from '../api/lines-data/lines-data.service';
import { UploadLinesExposureStatusDto } from '../api/lines-data/dto/upload-asset-exposure-status.dto';
import { LinesDataEnum } from '../api/lines-data/lines-data.entity';
import { PointDataEnum } from '../api/point-data/point-data.entity';
import { UploadDynamicPointDataDto } from '../api/point-data/dto/upload-asset-exposure-status.dto';
import { PointDataService } from '../api/point-data/point-data.service';
import { DisasterTypeGeoServerMapper } from './disaster-type-geoserver-file.mapper';
import { GeoseverSyncService as GeoServerSyncService } from './geoserver-sync.service';
import { DEBUG } from '../config';

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
    private linesDataService: LinesDataService,
    private pointDataService: PointDataService,
    private geoServerSyncService: GeoServerSyncService,
  ) {}

  public async mockAll(mockAllInput: MockAll) {
    const envCountries = process.env.COUNTRIES.split(',');

    for await (const countryCodeISO3 of envCountries) {
      const country = await this.countryRepo.findOne({
        where: { countryCodeISO3: countryCodeISO3 },
        relations: ['disasterTypes'],
      });

      for await (const disasterType of country.disasterTypes) {
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

    if (mockInput.disasterType === DisasterType.Floods) {
      await this.mockGlofasStations(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
        date,
      );
      await this.mockTriggerPerLeadTime(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
        eventNr,
        date,
      );
    }

    if (
      [
        DisasterType.Floods,
        DisasterType.HeavyRain,
        DisasterType.Drought,
        DisasterType.FlashFloods,
      ].includes(mockInput.disasterType)
    ) {
      await this.mockRasterFile(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
      );
    }

    if (mockInput.disasterType === DisasterType.FlashFloods) {
      await this.mockExposedAssets(
        selectedCountry.countryCodeISO3,
        mockInput.triggered,
        date,
      );
      await this.mockDynamicPointData(
        selectedCountry.countryCodeISO3,
        mockInput.disasterType,
        date,
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

    // for now base on SSD, make more generic later
    if (mockInput.countryCodeISO3 === 'SSD') {
      await this.mockMapImageFile(
        selectedCountry.countryCodeISO3,
        mockInput.disasterType,
        mockInput.triggered,
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

    if (
      disasterType === DisasterType.Dengue ||
      disasterType === DisasterType.Malaria
    ) {
      exposureUnits.push(DynamicIndicator.potentialThreshold);
    } else if (disasterType === DisasterType.Typhoon) {
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
    triggered: boolean,
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
      } else if (disasterType === DisasterType.FlashFloods) {
        return ['Rumphi', 'Karonga'];
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
    } else if (disasterType === DisasterType.FlashFloods) {
      return eventRegion;
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
    } else if (disasterType === DisasterType.FlashFloods) {
      return this.useFlashFloodsLeadTime(leadTime as LeadTime, triggered);
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

  private useFlashFloodsLeadTime(
    leadTime: LeadTime,
    triggered: boolean,
  ): boolean {
    if (triggered) {
      return [LeadTime.hour24, LeadTime.hour6].includes(leadTime);
    } else {
      return leadTime === LeadTime.hour1;
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
    // This only returns something different for dengue/malaria exposure-units
    if ([DisasterType.Dengue, DisasterType.Malaria].includes(disasterType)) {
      for (const pcodeData of copyOfExposureUnit) {
        if (exposureUnit === DynamicIndicator.potentialCases65) {
          pcodeData.amount = Math.round(pcodeData.amount * 0.1);
        } else if (
          exposureUnit === DynamicIndicator.potentialCasesU9 ||
          exposureUnit === DynamicIndicator.potentialCasesU5
        ) {
          pcodeData.amount = Math.round(pcodeData.amount * 0.2);
        } else if (exposureUnit === DynamicIndicator.alertThreshold) {
          if (!triggered) {
            pcodeData.amount = 0;
          } else {
            pcodeData.amount = [
              'PH137500000',
              'PH137400000',
              'PH133900000',
              'PH137600000',
              'PH031400000',
              'ET020303',
              'ET042105',
              'ET042104',
            ].includes(pcodeData.placeCode)
              ? 1
              : 0;
          }
        }
      }
    } else if (
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
    } else if (disasterType === DisasterType.FlashFloods && triggered) {
      if (
        (eventRegion === 'Karonga' && activeLeadTime === LeadTime.hour24) ||
        (eventRegion === 'Rumphi' && activeLeadTime === LeadTime.hour6)
      ) {
        // loop from the end so index stays correct during splicing
        for (let i = copyOfExposureUnit.length - 1; i >= 0; i--) {
          // if (
          //   copyOfExposureUnit[i].amount > 0 ||
          //   [LeadTime.hour24, LeadTime.hour48].includes(activeLeadTime)
          // ) {
          const adminArea = await this.adminAreaRepo.findOne({
            where: { placeCode: copyOfExposureUnit[i].placeCode },
          });
          const adminAreaParent = await this.adminAreaRepo.findOne({
            where: { placeCode: adminArea.placeCodeParent },
          });
          if (adminAreaParent.name === eventRegion) {
            // leave this as is ..
            continue;
          }
          // }
          // .. remove the rest from upload
          copyOfExposureUnit.splice(i, 1);
        }
      } else {
        copyOfExposureUnit = [];
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

  private async mockGlofasStations(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
    date: Date,
  ) {
    // TODO: this is still the old glofas input-format, needs to be updated
    const stationsFileName = `./src/api/point-data/dto/example/glofas-stations/glofas-stations-${
      selectedCountry.countryCodeISO3
    }${triggered ? '-triggered' : ''}.json`;
    const stationsRaw = fs.readFileSync(stationsFileName, 'utf-8');
    const stations = JSON.parse(stationsRaw);

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

  private async mockTriggerPerLeadTime(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
    eventNr = 1,
    date: Date,
  ) {
    const triggersFileName = `./src/api/event/dto/example/triggers-per-leadtime-${
      selectedCountry.countryCodeISO3
    }${triggered ? '-triggered' : ''}.json`;
    const triggersRaw = fs.readFileSync(triggersFileName, 'utf-8');
    const triggers = JSON.parse(triggersRaw);

    await this.eventService.uploadTriggerPerLeadTime({
      countryCodeISO3: selectedCountry.countryCodeISO3,
      triggersPerLeadTime: triggers,
      disasterType: disasterType,
      eventName: this.getEventName(disasterType, eventNr),
      date,
    });
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

  private async mockRasterFile(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
    // Add the needed stores and layers to geoserver, only do this in debug mode
    // The resulting XML files should be commited to git and will end up on the servers that way
    if (DEBUG) {
      await this.geoServerSyncService.sync(
        selectedCountry.countryCodeISO3,
        disasterType,
      );
    }
    for await (const leadTime of selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).activeLeadTimes) {
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

  private getMockRasterSourceFileName(
    disasterType: DisasterType,
    countryCodeISO3: string,
    leadTime: string,
    triggered?: boolean,
  ) {
    const directoryPath = './geoserver-volume/raster-files/mock-output/';
    const leadTimeUnit = leadTime.replace(/\d+-/, '');

    const files = fs.readdirSync(directoryPath);

    const layerStorePrefix =
      DisasterTypeGeoServerMapper.getLayerStorePrefixForDisasterType(
        disasterType
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
    const prefix = DisasterTypeGeoServerMapper.getDestFilePrefixForDisasterType(
      disasterType,
      countryCode,
    );
    return `${prefix}_${leadTime}_${countryCode}.tif`;
  }

  private async mockMapImageFile(
    countryCodeISO3: string,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
    if (!triggered) {
      return;
    }
    console.log(`Seeding event map image country: ${countryCodeISO3}`);

    const eventName = this.getEventName(disasterType) || 'no-name';
    const filename = `${countryCodeISO3}_${disasterType}_${eventName}_map-image.png`;
    const file = fs.readFileSync(
      `./geoserver-volume/raster-files/mock-output/${filename}`,
    );
    const dataObject = {
      originalname: filename,
      buffer: file,
    };
    await this.eventService.postEventMapImage(
      countryCodeISO3,
      disasterType,
      eventName,
      dataObject,
    );
  }
}
