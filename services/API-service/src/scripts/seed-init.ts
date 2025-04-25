import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

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
import { IndicatorMetadataEntity } from '../api/metadata/indicator-metadata.entity';
import { LayerMetadataEntity } from '../api/metadata/layer-metadata.entity';
import { NotificationInfoEntity } from '../api/notification/notifcation-info.entity';
import { UserEntity } from '../api/user/user.entity';
import { UserRole } from '../api/user/user-role.enum';
import countries from './json/countries.json';
import disasterTypes from './json/disaster-types.json';
import eapActions from './json/EAP-actions.json';
import indicatorMetadata from './json/indicator-metadata.json';
import layerMetadata from './json/layer-metadata.json';
import notificationInfo from './json/notification-info.json';
import users from './json/users.json';
import { InterfaceScript } from './scripts.module';
import SeedAdminArea from './seed-admin-area';
import SeedAdminAreaData from './seed-admin-area-data';
import { SeedHelper } from './seed-helper';
import SeedLineData from './seed-line-data';
import SeedPointData from './seed-point-data';

@Injectable()
export class SeedInit implements InterfaceScript {
  private readonly seedHelper: SeedHelper;
  private logger = new Logger('SeedInit');

  public constructor(
    private dataSource: DataSource,
    private seedAdminArea: SeedAdminArea,
    private seedAdminAreaData: SeedAdminAreaData,
    private seedPointData: SeedPointData,
    private seedLineData: SeedLineData,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }
  public async run(_argv: object, includeLinesData: boolean): Promise<void> {
    await this.seedHelper.truncateAll();

    // ***** CREATE DISASTER *****
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

    // ***** CREATE COUNTRIES *****
    this.logger.log(`Seed Countries... ${process.env.COUNTRIES}`);
    const envCountries = process.env.COUNTRIES.split(',');
    const selectedCountries = countries.filter((country): boolean => {
      return envCountries.includes(country.countryCodeISO3);
    });

    const envDisasterTypes = process.env.DISASTER_TYPES.split(',');
    await this.countryService.addOrUpdateCountries(
      { countries: selectedCountries },
      envDisasterTypes,
    );

    const countryRepository = this.dataSource.getRepository(CountryEntity);
    const countryEntities = [];
    for await (const countryEntity of await countryRepository.find()) {
      const notificationInfoEntity = new NotificationInfoEntity();
      const notificationInfoCountry: NotificationInfoDto =
        notificationInfo.find((notificationInfoEntry): NotificationInfoDto => {
          if (
            notificationInfoEntry.countryCodeISO3 ===
            countryEntity.countryCodeISO3
          ) {
            return notificationInfoEntry;
          }
        });
      countryEntity.notificationInfo =
        await this.countryService.createNotificationInfo(
          notificationInfoEntity,
          notificationInfoCountry,
        );
      countryEntities.push(countryEntity);
    }

    await countryRepository.save(countryEntities);

    // ***** SEED ADMIN-AREA DATA *****
    this.logger.log('Seed Admin Areas...');
    await this.seedAdminArea.run();

    // ***** CREATE USERS *****
    this.logger.log('Seed Users...');
    const userRepository = this.dataSource.getRepository(UserEntity);

    const dunantEmail = 'dunant@redcross.nl';
    let selectedUsers;
    if (process.env.PRODUCTION_DATA_SERVER === 'yes') {
      selectedUsers = users.filter((user): boolean => {
        return user.userRole === UserRole.Admin;
      });
      selectedUsers[0].password = process.env.ADMIN_PASSWORD;
    } else {
      const dunantUser = await userRepository.findOne({
        where: { email: dunantEmail },
      });
      if (dunantUser) {
        selectedUsers = users.filter((user) => user.email !== dunantEmail);
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
              where: user.disasterTypes.map((disasterType: string): object => {
                return { disasterType };
              }),
            });
        userEntity.password = user.password;
        return userEntity;
      }),
    );

    await userRepository.save(userEntities);

    // ***** CREATE EAP ACTIONS *****
    this.logger.log('Seed EAP Actions...');
    const filteredActions: EapActionEntity[] = eapActions
      .map((action): EapActionEntity => {
        const eapActionEntity = new EapActionEntity();
        eapActionEntity.countryCodeISO3 = action.countryCodeISO3;
        eapActionEntity.disasterType = action.disasterType;
        eapActionEntity.action = action.action;
        eapActionEntity.label = action.label;
        eapActionEntity.areaOfFocusId = action.areaOfFocusId as string;
        eapActionEntity.month = JSON.parse(JSON.stringify(action.month || {}));
        return eapActionEntity;
      })
      .filter((action: EapActionEntity): boolean => {
        return envCountries.includes(action.countryCodeISO3);
      });
    const eapActionRepository = this.dataSource.getRepository(EapActionEntity);
    await eapActionRepository.save(filteredActions);

    // ***** CREATE INDICATOR METADATA *****
    this.logger.log('Seed Indicators...');
    const indicatorRepository = this.dataSource.getRepository(
      IndicatorMetadataEntity,
    );
    await indicatorRepository.save(
      JSON.parse(JSON.stringify(indicatorMetadata)),
    );

    // ***** CREATE LAYER METADATA *****
    this.logger.log('Seed Layers...');
    const layerRepository = this.dataSource.getRepository(LayerMetadataEntity);
    await layerRepository.save(JSON.parse(JSON.stringify(layerMetadata)));

    // ***** SEED POINT DATA *****
    this.logger.log('Seed Point data...');
    await this.seedPointData.run();

    // ***** SEED LINE DATA *****
    if (includeLinesData) {
      await this.seedLineData.run();
    }

    // ***** SEED INDICATOR DATA PER ADMIN AREA *****
    this.logger.log('Seed Indicator data per admin-area...');
    await this.seedAdminAreaData.run();
  }
}

export default SeedInit;
