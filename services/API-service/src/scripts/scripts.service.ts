import fs from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
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
import countries from './json/countries.json';
import { MockHelperService } from './mock-helper.service';
import { MockDynamic } from './scripts.controller';

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
    private eventService: EventService,
    private metadataService: MetadataService,
    private mockHelperService: MockHelperService,
  ) {}

  public async mockCountry(mockInput: MockDynamic) {
    if (mockInput.removeEvents) {
      const countryAdminAreaIds =
        await this.eventService.getCountryAdminAreaIds(
          mockInput.countryCodeISO3,
        );

      const allCountryEvents = await this.eventPlaceCodeRepo.find({
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
      date,
    );

    if ([DisasterType.HeavyRain].includes(mockInput.disasterType)) {
      await this.mockHelperService.mockRasterFile(
        selectedCountry,
        mockInput.disasterType,
        mockInput.triggered,
      );
    }

    // Close finished events (only applicable for follow-up mock pipeline runs, with removeEvents=false)
    await this.eventService.closeEventsAutomatic(
      selectedCountry.countryCodeISO3,
      mockInput.disasterType,
    );
  }

  private async mockExposure(
    selectedCountry,
    disasterType: DisasterType,
    triggered: boolean,
    date: Date,
  ) {
    // Define indicators to upload ..
    const exposureUnits = await this.getIndicators(
      selectedCountry.countryCodeISO3,
      disasterType,
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
          selectedCountry.countryCodeISO3,
          disasterType,
          triggered,
        );

        // For every lead-time .. (repeat the same data for every lead-time)
        for (const activeLeadTime of this.getLeadTimes(
          selectedCountry,
          disasterType,
        )) {
          const eventName = null;
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

  private getMockData(
    unit: DynamicIndicator,
    adminLevel: AdminLevel,
    countryCodeISO3: string,
    disasterType: DisasterType,
    triggered: boolean,
  ) {
    const fileName = `upload-${unit}-${adminLevel}`;
    const ROOT_DIR = path.resolve(
      './src/api/admin-area-dynamic-data/dto/example',
    );
    const filePath = path.resolve(
      ROOT_DIR,
      `${countryCodeISO3}/${disasterType}/${fileName}.json`,
    );
    if (!filePath.startsWith(ROOT_DIR)) {
      throw new Error('Invalid file path');
    }
    const exposureRaw = fs.readFileSync(filePath, 'utf-8');
    const exposure = JSON.parse(exposureRaw);

    // If non-triggered, replace all values by 0
    if (!triggered) {
      exposure.forEach((area) => (area.amount = 0));
    }

    return exposure;
  }

  private getLeadTimes(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedCountry: any,
    disasterType: DisasterType,
  ) {
    const leadTimes = selectedCountry.countryDisasterSettings.find(
      (s) => s.disasterType === disasterType,
    ).activeLeadTimes;
    return leadTimes;
  }

  private async mockAmount(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exposurePlaceCodes: any,
  ) {
    const copyOfExposureUnit = JSON.parse(JSON.stringify(exposurePlaceCodes));
    return copyOfExposureUnit;
  }
}
