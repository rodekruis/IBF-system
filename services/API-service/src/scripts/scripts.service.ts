import { Injectable } from '@nestjs/common';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { GlofasStationService } from '../api/glofas-station/glofas-station.service';
import { MockAll, MockDynamic } from './scripts.controller';
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

@Injectable()
export class ScriptsService {
  private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService;
  private readonly glofasStationService: GlofasStationService;
  private readonly eventService: EventService;

  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepo: Repository<EapActionStatusEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepo: Repository<CountryEntity>;

  public constructor(
    adminAreaDynamicDataService: AdminAreaDynamicDataService,
    glofasStationService: GlofasStationService,
    eventService: EventService,
  ) {
    this.adminAreaDynamicDataService = adminAreaDynamicDataService;
    this.glofasStationService = glofasStationService;
    this.eventService = eventService;
  }

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
        });
      }
    }
  }

  public async mockCountry(mockInput: MockDynamic) {
    if (mockInput.removeEvents) {
      const countryAdminAreaIds = await this.eventService.getCountryAdminAreaIds(
        mockInput.countryCodeISO3,
      );
      const allCountryEvents = await this.eventPlaceCodeRepo.find({
        relations: ['eapActionStatuses', 'adminArea'],
        where: {
          adminArea: In(countryAdminAreaIds),
          disasterType: mockInput.disasterType,
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
  }

  private async mockExposure(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
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
        DynamicIndicator.housesAffected,
        DynamicIndicator.probWithin50Km,
        DynamicIndicator.alertThreshold, // NOTE: Must be as last in current set up!
      ];
    } else {
      exposureUnits = [
        DynamicIndicator.populationAffectedPercentage,
        DynamicIndicator.populationAffected,
      ];
    }

    for (const unit of exposureUnits) {
      for (const adminLevel of selectedCountry.countryDisasterSettings.find(
        s => s.disasterType === disasterType,
      ).adminLevels) {
        let fileName: string;
        if (
          disasterType === DisasterType.Dengue ||
          disasterType === DisasterType.Malaria
        ) {
          if (unit === DynamicIndicator.potentialThreshold) {
            fileName = `upload-exposure-potential-cases-threshold`;
          } else fileName = `upload-exposure`;
        } else {
          fileName = `upload-${unit}-${adminLevel}`;
        }
        const exposureFileName = `./src/api/admin-area-dynamic-data/dto/example/${selectedCountry.countryCodeISO3}/${disasterType}/${fileName}.json`;
        const exposureRaw = fs.readFileSync(exposureFileName, 'utf-8');
        const exposure = JSON.parse(exposureRaw);

        if (!triggered && unit !== DynamicIndicator.potentialThreshold) {
          exposure.forEach(area => (area.amount = 0));
        }

        for (const activeLeadTime of selectedCountry.countryDisasterSettings.find(
          s => s.disasterType === disasterType,
        ).activeLeadTimes) {
          if (this.filterLeadTimesDrought(activeLeadTime, disasterType)) {
            console.log(
              `Seeding exposure for leadtime: ${activeLeadTime} unit: ${unit} for country: ${selectedCountry.countryCodeISO3} for adminLevel: ${adminLevel}`,
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
            });
          }
        }
      }
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

  private filterLeadTimesDrought(leadTime: string, disasterType: DisasterType) {
    if (disasterType !== DisasterType.Drought) {
      return true;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const nextAprilYear = now.getUTCMonth() > 3 ? currentYear + 1 : currentYear;
    const nextAprilMonthFirstDay = new Date(nextAprilYear, 3, 1);

    const leadTimeMonth = new Date(
      now.setUTCMonth(now.getUTCMonth() + Number(leadTime.split('-')[0])),
    );
    const leadTimeMonthFirstDay = new Date(
      leadTimeMonth.getFullYear(),
      leadTimeMonth.getUTCMonth(),
      1,
    );

    return nextAprilMonthFirstDay.getTime() === leadTimeMonthFirstDay.getTime();
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
        `Seeding Glofas stations for leadtime: ${activeLeadTime} for country: ${selectedCountry.countryCodeISO3}`,
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
        `Seeding disaster extent raster file for leadtime: ${leadTime} for country: ${selectedCountry.countryCodeISO3}`,
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
