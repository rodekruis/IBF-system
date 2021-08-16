import { Injectable } from '@nestjs/common';
import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { GlofasStationService } from '../api/glofas-station/glofas-station.service';
import { MockDynamic } from './scripts.controller';
import countries from './json/countries.json';
import fs from 'fs';
import { DynamicIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-data-unit';
import { LeadTime } from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { EventService } from '../api/event/event.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EventPlaceCodeEntity } from '../api/event/event-place-code.entity';
import { In, Repository } from 'typeorm';
import { EapActionStatusEntity } from '../api/eap-actions/eap-action-status.entity';
import { LeadTimeEntity } from '../api/lead-time/lead-time.entity';

@Injectable()
export class ScriptsService {
  private readonly adminAreaDynamicDataService: AdminAreaDynamicDataService;
  private readonly glofasStationService: GlofasStationService;
  private readonly eventService: EventService;

  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(EapActionStatusEntity)
  private readonly eapActionStatusRepo: Repository<EapActionStatusEntity>;
  @InjectRepository(LeadTimeEntity)
  private readonly leadTimeRepo: Repository<LeadTimeEntity>;

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
      await this.mockGlofasStations(selectedCountry, mockInput.triggered);
      await this.mockTriggerPerLeadTime(
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
        DynamicIndicator.alertThreshold,
        DynamicIndicator.potentialCases65,
        DynamicIndicator.potentialCasesU9,
        DynamicIndicator.potentialCasesU5,
        DynamicIndicator.potentialCases,
        DynamicIndicator.potentialThreshold,
      ];
    } else if (disasterType === DisasterType.Drought) {
      exposureUnits = [
        DynamicIndicator.populationAffected,
        DynamicIndicator.alertThreshold,
      ];
    } else {
      exposureUnits = [
        DynamicIndicator.populationAffected,
        DynamicIndicator.populationAffectedPercentage,
      ];
    }

    for (const unit of exposureUnits) {
      let fileName: string;
      if (
        disasterType === DisasterType.Dengue ||
        disasterType === DisasterType.Malaria
      ) {
        if (unit === DynamicIndicator.potentialThreshold) {
          fileName = `upload-exposure-${selectedCountry.countryCodeISO3}-potential-cases-threshold`;
        } else
          fileName = `upload-exposure-${selectedCountry.countryCodeISO3}${
            triggered ? '-triggered' : ''
          }`;
      } else {
        fileName = `upload-${unit}-${selectedCountry.countryCodeISO3}${
          triggered ? '-triggered' : ''
        }`;
      }
      const exposureFileName = `./src/api/admin-area-dynamic-data/dto/example/${selectedCountry.countryCodeISO3}/${fileName}.json`;

      const exposureRaw = fs.readFileSync(exposureFileName, 'utf-8');
      const exposure = JSON.parse(exposureRaw);

      for (const activeLeadTime of selectedCountry.countryActiveLeadTimes) {
        const leadTime = await this.leadTimeRepo.findOne({
          relations: ['disasterTypes'],
          where: { leadTimeName: activeLeadTime },
        });
        if (
          leadTime.disasterTypes.map(d => d.disasterType).includes(disasterType)
        ) {
          console.log(
            `Seeding exposure for leadtime: ${activeLeadTime} unit: ${unit} for country: ${selectedCountry.countryCodeISO3}`,
          );
          await this.adminAreaDynamicDataService.exposure({
            countryCodeISO3: selectedCountry.countryCodeISO3,
            exposurePlaceCodes: this.mockAmount(
              exposure,
              unit,
              triggered,
              activeLeadTime,
            ),
            leadTime: activeLeadTime as LeadTime,
            dynamicIndicator: unit,
            adminLevel: selectedCountry.defaultAdminLevel,
            disasterType: disasterType,
          });
        }
      }
    }
  }

  private mockAmount(
    exposurePlacecodes: any,
    exposureUnit: DynamicIndicator,
    triggered: boolean,
    activeLeadTime: string,
  ): any[] {
    // This only returns something different for dengue exposure-units
    const copyOfExposureUnit = JSON.parse(JSON.stringify(exposurePlacecodes));
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
            'ZW11',
            'ZW12',
            'ZW13',
          ].includes(pcodeData.placeCode)
            ? 1
            : 0;
          if (
            activeLeadTime === LeadTime.month0 &&
            pcodeData.placeCode == 'PH137500000'
          ) {
            pcodeData.amount = 0;
          }
        }
      }
    }
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
}
