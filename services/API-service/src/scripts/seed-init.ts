import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import 'multer';
import {
  LeadTime,
  LeadTimeUnit,
} from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../api/country/country.entity';
import { CountryService } from '../api/country/country.service';
import { NotificationInfoDto } from '../api/country/dto/notification-info.dto';
import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { DisasterTypeService } from '../api/disaster-type/disaster-type.service';
import { DisasterTypeDto } from '../api/disaster-type/dto/add-disaster-type.dto';
import { EapActionEntity } from '../api/eap-actions/eap-action.entity';
import { IndicatorMetadataEntity } from '../api/metadata/indicator-metadata.entity';
import { LayerMetadataEntity } from '../api/metadata/layer-metadata.entity';
import { NotificationInfoEntity } from '../api/notification/notifcation-info.entity';
import { UserService } from '../api/user/user.service';
import { DUNANT_EMAIL } from '../config';
import { defaultSeed, emptySeed, SeedDto } from './dto/seed.dto';
import { Country } from './interfaces/country.interface';
import countries from './json/countries.json';
import disasterTypes from './json/disaster-types.json';
import eapActions from './json/EAP-actions.json';
import indicatorMetadata from './json/indicator-metadata.json';
import layerMetadata from './json/layer-metadata.json';
import notificationInfo from './json/notification-info.json';
import { InterfaceScript } from './scripts.module';
import SeedAdminArea from './seed-admin-area';
import { SeedHelper } from './seed-helper';
import SeedIndicators from './seed-indicators';
import SeedLineData from './seed-line-data';
import SeedPointData from './seed-point-data';

interface SeedInitParams {
  reset: boolean;
  seed: SeedDto;
}

@Injectable()
export class SeedInit implements InterfaceScript<SeedInitParams> {
  private readonly seedHelper: SeedHelper;
  private logger = new Logger('SeedInit');

  public constructor(
    private dataSource: DataSource,
    private seedAdminArea: SeedAdminArea,
    private seedIndicators: SeedIndicators,
    private seedPointData: SeedPointData,
    private seedLineData: SeedLineData,
    private userService: UserService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }
  public async seed({ reset = false, seed = emptySeed }) {
    const dunantUser = await this.userService.findByEmail(DUNANT_EMAIL);

    if (reset) {
      // reset database if called via /api/seed?reset=true
      await this.seedHelper.reset();
    } else if (!dunantUser) {
      // seed db if dunant user not found
      // this is useful for local development
      this.logger.log('Admin user not found. Use default seed...');
      seed = defaultSeed;
    }

    // ***** CREATE DISASTER *****
    if (seed.hazards) {
      this.logger.log('Seed Disaster Types...');
      const disasterTypeDtos = disasterTypes.map(
        (disasterType): DisasterTypeDto => {
          const disasterTypeDto = new DisasterTypeDto();
          disasterTypeDto.disasterType =
            disasterType.disasterType as DisasterType;
          disasterTypeDto.label = disasterType.label;
          disasterTypeDto.mainExposureIndicator =
            disasterType.mainExposureIndicator;
          disasterTypeDto.showOnlyTriggeredAreas =
            disasterType.showOnlyTriggeredAreas;
          disasterTypeDto.enableSetWarningToTrigger =
            disasterType.enableSetWarningToTrigger;
          disasterTypeDto.leadTimeUnit =
            disasterType.leadTimeUnit as LeadTimeUnit;
          disasterTypeDto.minLeadTime = disasterType.minLeadTime as LeadTime;
          disasterTypeDto.maxLeadTime = disasterType.maxLeadTime as LeadTime;
          return disasterTypeDto;
        },
      );
      await this.disasterTypeService.addOrUpdateDisasterTypes({
        disasterTypes: disasterTypeDtos,
      });
    }

    const envCountries =
      process.env.COUNTRIES?.split(',').filter(Boolean) ?? [];
    const selectedCountries = (countries as Country[]).filter(
      ({ countryCodeISO3 }) =>
        envCountries.length === 0 || envCountries.includes(countryCodeISO3),
    );
    const selectedCountryCodes = selectedCountries.map(
      ({ countryCodeISO3 }) => countryCodeISO3,
    );
    const countryRepository = this.dataSource.getRepository(CountryEntity);

    // ***** CREATE COUNTRIES *****
    if (seed.countries) {
      this.logger.log(`Seed Countries... ${selectedCountryCodes.join(',')}`);

      const envDisasterTypes =
        process.env.DISASTER_TYPES?.split(',').filter(Boolean) ?? [];
      await this.countryService.upsertCountries(
        selectedCountries,
        envDisasterTypes as DisasterType[],
      );

      const countryEntities = [];
      for await (const countryEntity of await countryRepository.find()) {
        const notificationInfoEntity = new NotificationInfoEntity();
        const notificationInfoCountry: NotificationInfoDto =
          notificationInfo.find(
            (notificationInfoEntry): NotificationInfoDto => {
              if (
                notificationInfoEntry.countryCodeISO3 ===
                countryEntity.countryCodeISO3
              ) {
                return notificationInfoEntry;
              }
            },
          );
        countryEntity.notificationInfo =
          await this.countryService.createNotificationInfo(
            notificationInfoEntity,
            notificationInfoCountry,
          );
        countryEntities.push(countryEntity);
      }

      await countryRepository.save(countryEntities);
    }

    // ***** SEED ADMIN-AREA DATA *****
    if (seed.adminAreas) {
      this.logger.log('Seed Admin Areas...');

      for (const country of selectedCountries) {
        await this.seedAdminArea.seed(country);
      }
    }

    // ***** CREATE USERS *****
    if (seed.users) {
      this.logger.log('Seed admin user...');
      await this.seedHelper.upsertDunantUser(this.userService);
    }

    // ***** CREATE EAP ACTIONS *****
    if (seed.eapActions) {
      this.logger.log('Seed EAP Actions...');
      const filteredActions: EapActionEntity[] = eapActions
        .map((action): EapActionEntity => {
          const eapActionEntity = new EapActionEntity();
          eapActionEntity.countryCodeISO3 = action.countryCodeISO3;
          eapActionEntity.disasterType = action.disasterType;
          eapActionEntity.action = action.action;
          eapActionEntity.label = action.label;
          eapActionEntity.areaOfFocusId = action.areaOfFocusId as string;
          eapActionEntity.month = JSON.parse(
            JSON.stringify(action.month || {}),
          );
          return eapActionEntity;
        })
        .filter((action: EapActionEntity) =>
          selectedCountryCodes.includes(action.countryCodeISO3),
        );
      const eapActionRepository =
        this.dataSource.getRepository(EapActionEntity);
      await eapActionRepository.save(filteredActions);
    }

    // ***** CREATE METADATA *****
    if (seed.metadata) {
      this.logger.log('Seed metadata...');
      const indicatorRepository = this.dataSource.getRepository(
        IndicatorMetadataEntity,
      );
      await indicatorRepository.upsert(
        JSON.parse(JSON.stringify(indicatorMetadata)),
        ['name'],
      );

      const layerRepository =
        this.dataSource.getRepository(LayerMetadataEntity);
      await layerRepository.upsert(JSON.parse(JSON.stringify(layerMetadata)), [
        'name',
      ]);
    }

    for (const { countryCodeISO3, countryBoundingBox } of selectedCountries) {
      // ***** SEED POINT DATA *****
      if (seed.pointData) {
        for (const pointDataCategory of seed.pointData) {
          this.logger.log(`Seed ${countryCodeISO3} ${pointDataCategory}...`);
          await this.seedPointData.seed({
            pointDataCategory,
            countryCodeISO3,
            countryBoundingBox,
          });
        }
      }

      // ***** SEED LINE DATA *****
      if (seed.lineData) {
        for (const lineDataCategory of seed.lineData) {
          this.logger.log(`Seed ${countryCodeISO3} ${lineDataCategory}...`);
          await this.seedLineData.seed({ lineDataCategory, countryCodeISO3 });
        }
      }

      // ***** SEED INDICATORS *****
      if (seed.indicators) {
        for (const staticIndicator of seed.indicators) {
          this.logger.log(`Seed ${countryCodeISO3} ${staticIndicator}...`);
          await this.seedIndicators.seed({ staticIndicator, countryCodeISO3 });
        }
      }
    }
  }
}

export default SeedInit;
