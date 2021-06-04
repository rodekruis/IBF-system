import { Injectable } from '@nestjs/common';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { GlofasStationService } from '../api/glofas-station/glofas-station.service';
import { MockDynamic } from './scripts.controller';
import countries from './json/countries.json';
import fs from 'fs';
import { DynamicIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-indicator';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { EventService } from '../api/event/event.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EventPlaceCodeEntity } from '../api/event/event-place-code.entity';
import { Repository } from 'typeorm';
@Injectable()
export class ScriptsService {
  private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService;
  private readonly glofasStationService: GlofasStationService;
  private readonly eventService: EventService;

  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;

  public constructor(
    adminAreaDynamicDataService: AdminAreaDynamicDataService,
    glofasStationService: GlofasStationService,
    eventService: EventService,
  ) {
    this.adminAreaDynamicDataService = adminAreaDynamicDataService;
    this.glofasStationService = glofasStationService;
    this.eventService = eventService;
  }

  public async mockCountry(mockInput: MockDynamic) {
    if (mockInput.removeEvents) {
      const all = await this.eventPlaceCodeRepo.find()
      await this.eventPlaceCodeRepo.remove(all)
    }

    console.time('Mocking a country')
    const selectedCountry = countries.find((country): any => {
      if (mockInput.countryCodeISO3 === country.countryCodeISO3) {
        return country;
      }
    });

    await this.mockExposure(selectedCountry, mockInput.triggered);

    if (selectedCountry.disasterType === DisasterType.Floods) {
      await this.mockGlofasStations(selectedCountry, mockInput.triggered);
      await this.mockTriggerPerLeadTime(selectedCountry, mockInput.triggered);
    }
    console.timeEnd('Mocking a country')
  }

  private async mockExposure(selectedCountry, triggered: boolean) {
    let exposureUnits;
    if (selectedCountry.countryCodeISO3 === 'PHL') {
      exposureUnits = [
        DynamicIndicator.alertThreshold,
        DynamicIndicator.potentialCases65,
        DynamicIndicator.potentialCasesU9,
        DynamicIndicator.potentialCases,
        DynamicIndicator.potentialThreshold,
      ];
    } else {
      exposureUnits = [DynamicIndicator.populationAffected];
    }

    for (const unit of exposureUnits) {
      let exposureFileNameEnd: string;
      if (unit === DynamicIndicator.potentialThreshold) {
        exposureFileNameEnd = '-potential-cases-threshold'
      } else {
        exposureFileNameEnd = triggered ? '-triggered' : ''
      }
      const exposureFileName = `./src/api/admin-area-dynamic-data/dto/example/upload-exposure-${selectedCountry.countryCodeISO3
        }${exposureFileNameEnd}.json`;

      const exposureRaw = fs.readFileSync(exposureFileName, 'utf-8');
      const exposure = JSON.parse(exposureRaw);

      for (const activeLeadTime of selectedCountry.countryActiveLeadTimes) {
        console.log(
          `Seeding exposure for leadtime: ${activeLeadTime} unit: ${unit} for country: ${selectedCountry.countryCodeISO3}`,
        );
        await this.adminAreaDynamicDataService.exposure({
          countryCodeISO3: selectedCountry.countryCodeISO3,
          exposurePlaceCodes: this.mockAmount(exposure, unit, triggered),
          leadTime: activeLeadTime as LeadTime,
          dynamicIndicator: unit,
          adminLevel: selectedCountry.defaultAdminLevel,
        });
      }
    }
  }

  private mockAmount(
    exposurePlacecodes: any,
    exposureUnit: DynamicIndicator,
    triggered: boolean
  ): [] {
    console.time('Mock amount')
    const copyOfExposureUnit = JSON.parse(JSON.stringify(exposurePlacecodes));
    for (const pcodeData of copyOfExposureUnit) {
      if (exposureUnit === DynamicIndicator.potentialCases65) {
        pcodeData.amount = Math.round(pcodeData.amount * 0.1);
      } else if (exposureUnit === DynamicIndicator.potentialCasesU9) {
        pcodeData.amount = Math.round(pcodeData.amount * 0.2);
      } else if (exposureUnit === DynamicIndicator.alertThreshold) {
        if (!triggered) {
          pcodeData.amount = 0
        } else {
          pcodeData.amount = ['PH137500000', 'PH137400000', 'PH133900000', 'PH137600000', 'PH031400000'].includes(pcodeData.placeCode) ? 1 : 0
          }
        }
    }
    console.timeEnd('Mock amount')
    return copyOfExposureUnit;
  }

  private async mockGlofasStations(selectedCountry, triggered: boolean) {
    const stationsFileName = `./src/api/glofas-station/dto/example/glofas-stations-${
      selectedCountry.countryCodeISO3
    }${triggered ? '-triggered' : ''}.json`;
    const stationsRaw = fs.readFileSync(stationsFileName, 'utf-8');
    const stations = JSON.parse(stationsRaw);

    for (const activeLeadTime of selectedCountry.countryActiveLeadTimes) {
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

  private async mockTriggerPerLeadTime(selectedCountry, triggered: boolean) {
    const triggersFileName = `./src/api/event/dto/example/triggers-per-leadtime-${
      selectedCountry.countryCodeISO3
    }${triggered ? '-triggered' : ''}.json`;
    const triggersRaw = fs.readFileSync(triggersFileName, 'utf-8');
    const triggers = JSON.parse(triggersRaw);

    await this.eventService.uploadTriggerPerLeadTime({
      countryCodeISO3: selectedCountry.countryCodeISO3,
      triggersPerLeadTime: triggers,
    });
  }
}
