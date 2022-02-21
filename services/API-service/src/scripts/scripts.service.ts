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

@Injectable()
export class ScriptsService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepo: Repository<EapActionStatusEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepo: Repository<CountryEntity>;

  public constructor(
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
    private glofasStationService: GlofasStationService,
    private typhoonTrackService: TyphoonTrackService,
    private eventService: EventService,
    private metadataService: MetadataService,
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
          eventNr: 1,
        });
      }
    }
  }

  public async mockCountry(mockInput: MockDynamic) {
    // EventNr > 1 only allowed/sensible for typhoon, otherwise replace by 1
    const eventNr =
      mockInput.disasterType === DisasterType.Typhoon ? mockInput.eventNr : 1;

    if (mockInput.removeEvents) {
      const countryAdminAreaIds = await this.eventService.getCountryAdminAreaIds(
        mockInput.countryCodeISO3,
      );
      const allCountryEvents = await this.eventPlaceCodeRepo.find({
        relations: ['eapActionStatuses', 'adminArea'],
        where: {
          adminArea: In(countryAdminAreaIds),
          disasterType: mockInput.disasterType,
          eventName: this.getEventName(mockInput.disasterType, eventNr),
        },
      });
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

    await this.mockExposure(
      selectedCountry,
      mockInput.disasterType,
      mockInput.triggered,
      eventNr,
    );

    if (mockInput.disasterType === DisasterType.Floods) {
      await this.mockGlofasStations(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
      );
      await this.mockTriggerPerLeadTime(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
        eventNr,
      );
    }

    if (
      mockInput.disasterType === DisasterType.Floods ||
      mockInput.disasterType === DisasterType.HeavyRain
    ) {
      await this.mockRasterFile(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
      );
    }

    if (mockInput.disasterType === DisasterType.Typhoon) {
      await this.mockTyphoonTrack(
        selectedCountry,
        mockInput.triggered,
        eventNr,
      );
    }
  }

  public async mockTyphoonScenario(mockTyphoonScenario: MockTyphoonScenario) {
    // For now ignore the 'multi-event cases' in this specific scenario endpoint > so eventNr = 1 always
    // Always assume 'removeEvents' = false, because this endpoint is meant to simulate a real-world consecutive serie of api-calls
    if (mockTyphoonScenario.scenario === TyphoonScenario.EventTrigger) {
      // Scenario 'eventTrigger' is equal to using the normal mock-endpoint for typhoon with 'triggered = true'
      await this.mockCountry({
        countryCodeISO3: mockTyphoonScenario.countryCodeISO3,
        disasterType: DisasterType.Typhoon,
        triggered: true,
        removeEvents: false,
        eventNr: 1,
        secret: mockTyphoonScenario.secret,
      });
    } else if (mockTyphoonScenario.scenario === TyphoonScenario.NoEvent) {
      const selectedCountry = countries.find((country): any => {
        if (mockTyphoonScenario.countryCodeISO3 === country.countryCodeISO3) {
          return country;
        }
      });
      await this.mockExposure(
        selectedCountry,
        DisasterType.Typhoon,
        false,
        1,
        TyphoonScenario.NoEvent,
      );
    } else {
      throw new HttpException(
        'Scenario not covered yet',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async mockExposure(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ) {
    // Define indicators to upload ..
    let exposureUnits;
    if (
      disasterType === DisasterType.Dengue ||
      disasterType === DisasterType.Malaria
    ) {
      exposureUnits = [
        DynamicIndicator.potentialCases65,
        DynamicIndicator.potentialCasesU9,
        DynamicIndicator.potentialCasesU5,
        DynamicIndicator.potentialCases,
        DynamicIndicator.potentialThreshold,
        DynamicIndicator.alertThreshold, // NOTE: Must be as last in current set up!
      ];
    } else if (disasterType === DisasterType.Drought) {
      exposureUnits = [
        DynamicIndicator.populationAffected,
        DynamicIndicator.cattleExposed,
        DynamicIndicator.smallRuminantsExposed,
        DynamicIndicator.alertThreshold, // NOTE: Must be as last in current set up!
      ];
    } else if (disasterType === DisasterType.Typhoon) {
      exposureUnits = [
        DynamicIndicator.windspeed,
        DynamicIndicator.rainfall,
        DynamicIndicator.probWithin50Km,
        DynamicIndicator.showAdminArea,
        DynamicIndicator.housesAffected,
        DynamicIndicator.alertThreshold, // NOTE: Must be as last in current set up!
      ];
      if (typhoonScenario === TyphoonScenario.NoEvent) {
        exposureUnits = [
          DynamicIndicator.housesAffected,
          DynamicIndicator.alertThreshold, // NOTE: Must be as last in current set up!
        ];
      }
    } else {
      exposureUnits = [
        DynamicIndicator.populationAffectedPercentage,
        DynamicIndicator.populationAffected,
        DynamicIndicator.alertThreshold, // NOTE: Must be as last in current set up!
      ];
    }

    // Filter out indicators that are not applicable for this country
    const indicators = await this.metadataService.getIndicatorsByCountryAndDisaster(
      selectedCountry.countryCodeISO3,
      disasterType,
    );
    exposureUnits = exposureUnits.filter(unit =>
      indicators.map(i => i.name).includes(unit),
    );

    // For every indicator ..
    for (const unit of exposureUnits) {
      // For every admin-level ..
      for (const adminLevel of selectedCountry.countryDisasterSettings.find(
        s => s.disasterType === disasterType,
      ).adminLevels) {
        // Get the right mock-data-file
        let fileName = `upload-${unit}-${adminLevel}`;
        if (eventNr > 1) {
          fileName = `${fileName}-eventNr-2`;
        }
        const exposureFileName = `./src/api/admin-area-dynamic-data/dto/example/${selectedCountry.countryCodeISO3}/${disasterType}/${fileName}.json`;
        const exposureRaw = fs.readFileSync(exposureFileName, 'utf-8');
        const exposure = JSON.parse(exposureRaw);

        // If non-triggered, replace all values by 0
        if (!triggered && unit !== DynamicIndicator.potentialThreshold) {
          exposure.forEach(area => (area.amount = 0));
        }

        // For every lead-time .. (repeat the same data for every lead-time)
        for (const activeLeadTime of selectedCountry.countryDisasterSettings.find(
          s => s.disasterType === disasterType,
        ).activeLeadTimes) {
          if (
            this.filterLeadTimesPerDisasterType(
              activeLeadTime,
              disasterType,
              eventNr,
              typhoonScenario,
            )
          ) {
            // Upload mock exposure data
            console.log(
              `Seeding exposure for country: ${selectedCountry.countryCodeISO3} for disasterType: ${disasterType} for adminLevel: ${adminLevel} for leadtime: ${activeLeadTime} for unit: ${unit} `,
            );
            await this.adminAreaDynamicDataService.exposure({
              countryCodeISO3: selectedCountry.countryCodeISO3,
              exposurePlaceCodes: this.mockAmount(
                exposure,
                unit,
                triggered,
                disasterType,
              ),
              leadTime: activeLeadTime as LeadTime,
              dynamicIndicator: unit,
              adminLevel: adminLevel,
              disasterType: disasterType,
              eventName: this.getEventName(
                disasterType,
                eventNr,
                typhoonScenario,
              ),
            });
          }
        }
      }
    }
  }

  private getEventName(
    disasterType: DisasterType,
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ): string {
    if (disasterType !== DisasterType.Typhoon) {
      return null;
    } else if (typhoonScenario === TyphoonScenario.NoEvent) {
      return null;
    } else {
      return `Mock typhoon ${eventNr}`;
    }
  }

  private getTyphoonLeadTime(
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ): string {
    if (typhoonScenario === TyphoonScenario.NoEvent) {
      return LeadTime.hour72;
    } else if (eventNr === 1) {
      return LeadTime.hour48;
    } else if (eventNr === 2) {
      return LeadTime.hour114;
    } else {
      return `${114 + eventNr}-hour` as LeadTime;
    }
  }

  private mockAmount(
    exposurePlacecodes: any,
    exposureUnit: DynamicIndicator,
    triggered: boolean,
    disasterType: DisasterType,
  ): any[] {
    const copyOfExposureUnit = JSON.parse(JSON.stringify(exposurePlacecodes));
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
    }
    return copyOfExposureUnit;
  }

  private filterLeadTimesPerDisasterType(
    leadTime: string,
    disasterType: DisasterType,
    eventNr = 1,
    typhoonScenario?: TyphoonScenario,
  ) {
    if (disasterType === DisasterType.Drought) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const nextAprilYear =
        now.getUTCMonth() > 3 ? currentYear + 1 : currentYear;
      const nextAprilMonthFirstDay = new Date(nextAprilYear, 3, 1);

      const currentMonthFirstDay = new Date(
        now.getFullYear(),
        now.getUTCMonth(),
        1,
      );
      const leadTimeMonthFirstDay = new Date(
        currentMonthFirstDay.setUTCMonth(
          now.getUTCMonth() + Number(leadTime.split('-')[0]),
        ),
      );

      return (
        nextAprilMonthFirstDay.getTime() === leadTimeMonthFirstDay.getTime()
      );
    } else if (disasterType === DisasterType.Typhoon) {
      return leadTime === this.getTyphoonLeadTime(eventNr, typhoonScenario);
    } else {
      return true;
    }
  }

  private async mockTyphoonTrack(
    selectedCountry,
    triggered: boolean,
    eventNr = 1,
  ) {
    const trackFileName = `./src/api/typhoon-track/dto/example/typhoon-track-${
      selectedCountry.countryCodeISO3
    }${eventNr > 1 ? `-eventNr-2` : ''}.json`;

    const trackRaw = fs.readFileSync(trackFileName, 'utf-8');
    const track = JSON.parse(trackRaw);

    // Overwrite timestamps of trackpoints to align with today's date
    // Make sure that the moment of landfall lies just ahead
    let i = -23;
    for (const trackpoint of track) {
      const now = new Date();
      trackpoint.timestampOfTrackpoint = new Date(
        now.getTime() + i * (1000 * 60 * 60 * 6),
      );
      i += 1;
    }

    const mockLeadTime = this.getTyphoonLeadTime(eventNr);

    console.log(
      `Seeding Typhoon track for country: ${selectedCountry.countryCodeISO3} for leadtime: ${mockLeadTime} `,
    );
    await this.typhoonTrackService.uploadTyphoonTrack({
      countryCodeISO3: selectedCountry.countryCodeISO3,
      leadTime: mockLeadTime as LeadTime,
      eventName: this.getEventName(DisasterType.Typhoon, eventNr),
      trackpointDetails: triggered ? track : [],
    });
  }

  private async mockGlofasStations(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
    const stationsFileName = `./src/api/glofas-station/dto/example/glofas-stations-${
      selectedCountry.countryCodeISO3
    }${triggered ? '-triggered' : ''}.json`;
    const stationsRaw = fs.readFileSync(stationsFileName, 'utf-8');
    const stations = JSON.parse(stationsRaw);

    for (const activeLeadTime of selectedCountry.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      console.log(
        `Seeding Glofas stations for country: ${selectedCountry.countryCodeISO3} for leadtime: ${activeLeadTime}`,
      );
      await this.glofasStationService.uploadTriggerDataPerStation({
        countryCodeISO3: selectedCountry.countryCodeISO3,
        stationForecasts: stations,
        leadTime: activeLeadTime as LeadTime,
      });
    }
  }

  private async mockTriggerPerLeadTime(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
    eventNr = 1,
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
    });
  }

  private async mockRasterFile(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
    for await (const leadTime of selectedCountry.countryDisasterSettings.find(
      s => s.disasterType === disasterType,
    ).activeLeadTimes) {
      console.log(
        `Seeding disaster extent raster file for country: ${selectedCountry.countryCodeISO3} for leadtime: ${leadTime}`,
      );

      let sourceFileName, destFileName;
      if (disasterType === DisasterType.Floods) {
        sourceFileName = `flood_extent_${leadTime}_${selectedCountry.countryCodeISO3}.tif`;
        destFileName = sourceFileName;
      } else if (disasterType === DisasterType.HeavyRain) {
        // Use 3-day mock for every lead-time
        sourceFileName = `rainfall_extent_3-day_${
          selectedCountry.countryCodeISO3
        }${triggered ? '-triggered' : ''}.tif`;
        destFileName = `rain_rp_${leadTime}_${selectedCountry.countryCodeISO3}.tif`;
      }

      const file = fs.readFileSync(
        `./geoserver-volume/raster-files/mock-output/${sourceFileName}`,
      );
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
}
