import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import 'multer';
import { StaticIndicator } from '../api/admin-area-dynamic-data/enum/dynamic-indicator.enum';
import {
  LeadTime,
  LeadTimeUnit,
} from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../api/country/country.entity';
import { CountryService } from '../api/country/country.service';
import { NotificationInfoDto } from '../api/country/dto/notification-info.dto';
import { DisasterTypeEntity } from '../api/disaster-type/disaster-type.entity';
import { DisasterType } from '../api/disaster-type/disaster-type.enum';
import { DisasterTypeService } from '../api/disaster-type/disaster-type.service';
import { DisasterTypeDto } from '../api/disaster-type/dto/add-disaster-type.dto';
import { EapActionEntity } from '../api/eap-actions/eap-action.entity';
import { LinesDataCategory } from '../api/lines-data/lines-data.entity';
import { IndicatorMetadataEntity } from '../api/metadata/indicator-metadata.entity';
import { LayerMetadataEntity } from '../api/metadata/layer-metadata.entity';
import { NotificationInfoEntity } from '../api/notification/notifcation-info.entity';
import { PointDataCategory } from '../api/point-data/point-data.entity';
import { UserEntity } from '../api/user/user.entity';
import { UserRole } from '../api/user/user-role.enum';
import { DUNANT_EMAIL } from '../config';
import { defaultSeed, emptySeed, SeedDto } from './dto/seed.dto';
import { Country } from './interfaces/country.interface';
import countries from './json/countries.json';
import disasterTypes from './json/disaster-types.json';
import eapActions from './json/EAP-actions.json';
import indicatorMetadata from './json/indicator-metadata.json';
import layerMetadata from './json/layer-metadata.json';
import notificationInfo from './json/notification-info.json';
import users from './json/users.json';
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
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }
  public async seed({ reset = false, seed = emptySeed }) {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const dunantUser = await userRepository.findOne({
      where: { email: DUNANT_EMAIL },
    });

    if (reset) {
      // reset database if called via /api/seed?reset=true
      await this.seedHelper.reset();
    } else if (!dunantUser) {
      // seed db if dunant user not found
      // this is useful for local development
      this.logger.log('Use default seed...');
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

    const envCountries = process.env.COUNTRIES.split(',');
    const selectedCountries = (countries as Country[]).filter(
      ({ countryCodeISO3 }) => envCountries.includes(countryCodeISO3),
    );
    const countryRepository = this.dataSource.getRepository(CountryEntity);

    // ***** CREATE COUNTRIES *****
    if (seed.countries) {
      this.logger.log(`Seed Countries... ${process.env.COUNTRIES}`);

      const envDisasterTypes = process.env.DISASTER_TYPES.split(',');
      await this.countryService.addOrUpdateCountries(
        { countries: selectedCountries },
        envDisasterTypes,
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
      await this.seedAdminArea.seed();
    }

    // ***** CREATE USERS *****
    if (seed.users) {
      this.logger.log('Seed Users...');
      let selectedUsers;
      if (process.env.PRODUCTION_DATA_SERVER === 'yes') {
        selectedUsers = users.filter((user): boolean => {
          return user.userRole === UserRole.Admin;
        });
        selectedUsers[0].password = process.env.ADMIN_PASSWORD;
      } else {
        if (dunantUser) {
          selectedUsers = users.filter((user) => user.email !== DUNANT_EMAIL);
          dunantUser.countries = await countryRepository.find();
          await userRepository.save(dunantUser);
        } else {
          selectedUsers = users;
        }
      }

      const disasterTypeRepository =
        this.dataSource.getRepository(DisasterTypeEntity);
      const userEntities = await Promise.all(
        selectedUsers.map(async (user): Promise<UserEntity> => {
          const userEntity = new UserEntity();
          userEntity.email = user.email;
          userEntity.firstName = user.firstName;
          userEntity.lastName = user.lastName;
          userEntity.userRole = user.userRole as UserRole;
          userEntity.countries = !user.countries
            ? await countryRepository.find()
            : await countryRepository.find({
                where: user.countries.map((countryCodeISO3: string): object => {
                  return { countryCodeISO3 };
                }),
              });
          userEntity.disasterTypes = !user.disasterTypes
            ? []
            : await disasterTypeRepository.find({
                where: user.disasterTypes.map(
                  (disasterType: string): object => {
                    return { disasterType };
                  },
                ),
              });
          userEntity.password = user.password;
          return userEntity;
        }),
      );

      await userRepository.save(userEntities);
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
        .filter((action: EapActionEntity): boolean => {
          return envCountries.includes(action.countryCodeISO3);
        });
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
      await indicatorRepository.save(
        JSON.parse(JSON.stringify(indicatorMetadata)),
      );

      const layerRepository =
        this.dataSource.getRepository(LayerMetadataEntity);
      await layerRepository.save(JSON.parse(JSON.stringify(layerMetadata)));
    }

    selectedCountries.flatMap(
      async ({ countryCodeISO3, countryBoundingBox }) => {
        // ***** SEED POINT DATA *****
        if (seed.pointData) {
          seed.pointData.forEach(
            async (pointDataCategory: PointDataCategory) => {
              this.logger.log(
                `Seed ${countryCodeISO3} ${pointDataCategory}...`,
              );
              await this.seedPointData.seed({
                pointDataCategory,
                countryCodeISO3,
                countryBoundingBox,
              });
            },
          );
        }

        // ***** SEED LINE DATA *****
        if (seed.lineData) {
          seed.lineData.forEach(async (lineDataCategory: LinesDataCategory) => {
            this.logger.log(`Seed ${countryCodeISO3} ${lineDataCategory}...`);
            await this.seedLineData.seed({ lineDataCategory, countryCodeISO3 });
          });
        }

        // ***** SEED INDICATORS *****
        if (seed.indicators) {
          seed.indicators.forEach(async (staticIndicator: StaticIndicator) => {
            this.logger.log(`Seed ${countryCodeISO3} ${staticIndicator}...`);
            await this.seedIndicators.seed({
              staticIndicator,
              countryCodeISO3,
            });
          });
        }
      },
    );
  }
}

export default SeedInit;
