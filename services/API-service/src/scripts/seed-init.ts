import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import {
  LeadTime,
  LeadTimeUnit,
} from '../api/admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../api/country/country.entity';
import { CountryService } from '../api/country/country.service';
import { NotificationInfoDto } from '../api/country/dto/notification-info.dto';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { DisasterEntity } from '../api/disaster/disaster.entity';
import { AreaOfFocusEntity } from '../api/eap-actions/area-of-focus.entity';
import { EapActionEntity } from '../api/eap-actions/eap-action.entity';
import { LeadTimeEntity } from '../api/lead-time/lead-time.entity';
import { IndicatorMetadataEntity } from '../api/metadata/indicator-metadata.entity';
import { LayerMetadataEntity } from '../api/metadata/layer-metadata.entity';
import { NotificationInfoEntity } from '../api/notification/notifcation-info.entity';
import { UserRole } from '../api/user/user-role.enum';
import { UserStatus } from '../api/user/user-status.enum';
import { UserEntity } from '../api/user/user.entity';
import areasOfFocus from './json/areas-of-focus.json';
import countries from './json/countries.json';
import disasters from './json/disasters.json';
import eapActions from './json/EAP-actions.json';
import indicatorMetadata from './json/indicator-metadata.json';
import layerMetadata from './json/layer-metadata.json';
import leadTimes from './json/lead-times.json';
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

  public constructor(
    private dataSource: DataSource,
    private seedAdminArea: SeedAdminArea,
    private seedAdminAreaData: SeedAdminAreaData,
    private seedPointData: SeedPointData,
    private seedLineData: SeedLineData,
    private countryService: CountryService,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async run(): Promise<void> {
    await this.seedHelper.truncateAll();

    // ***** CREATE DISASTER *****
    console.log('Seed Disasters...');
    const disasterRepository = this.dataSource.getRepository(DisasterEntity);
    const disasterEntities = disasters.map((disaster): DisasterEntity => {
      const disasterEntity = new DisasterEntity();
      disasterEntity.disasterType = disaster.disasterType as DisasterType;
      disasterEntity.label = disaster.label;
      disasterEntity.triggerUnit = disaster.triggerUnit;
      disasterEntity.actionsUnit = disaster.actionsUnit;
      disasterEntity.showOnlyTriggeredAreas = disaster.showOnlyTriggeredAreas;
      disasterEntity.leadTimeUnit = disaster.leadTimeUnit as LeadTimeUnit;
      disasterEntity.minLeadTime = disaster.minLeadTime as LeadTime;
      disasterEntity.maxLeadTime = disaster.maxLeadTime as LeadTime;
      return disasterEntity;
    });

    await disasterRepository.save(disasterEntities);

    // ***** CREATE LEAD TIMES *****
    console.log('Seed Lead Times...');
    const leadTimeRepository = this.dataSource.getRepository(LeadTimeEntity);

    const leadTimeEntities = await Promise.all(
      leadTimes.map(async (leadTime): Promise<LeadTimeEntity> => {
        const leadTimeEntity = new LeadTimeEntity();
        leadTimeEntity.leadTimeName = leadTime.leadTimeName;
        return leadTimeEntity;
      }),
    );

    await leadTimeRepository.save(leadTimeEntities);

    // ***** CREATE COUNTRIES *****
    console.log(`Seed Countries... ${process.env.COUNTRIES}`);
    const envCountries = process.env.COUNTRIES.split(',');
    const selectedCountries = countries.filter((country): boolean => {
      return envCountries.includes(country.countryCodeISO3);
    });

    const envDisasterTypes = process.env.DISASTER_TYPES.split(',');
    await this.countryService.addOrUpdateCountries(
      {
        countries: selectedCountries,
      },
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
    console.log('Seed Admin Areas...');
    await this.seedAdminArea.run();

    // ***** CREATE USERS *****
    console.log('Seed Users...');
    const userRepository = this.dataSource.getRepository(UserEntity);

    let selectedUsers;
    if (process.env.PRODUCTION_DATA_SERVER === 'yes') {
      selectedUsers = users.filter((user): boolean => {
        return user.userRole === UserRole.Admin;
      });
      selectedUsers[0].password = process.env.ADMIN_PASSWORD;
    } else {
      const dunantUser = await userRepository.findOne({
        where: { username: 'dunant' },
      });
      if (dunantUser) {
        selectedUsers = users.filter((user) => user.username !== 'dunant');
        dunantUser.countries = await countryRepository.find();
        await userRepository.save(dunantUser);
      } else {
        selectedUsers = users;
      }
    }

    const userEntities = await Promise.all(
      selectedUsers.map(async (user): Promise<UserEntity> => {
        const userEntity = new UserEntity();
        userEntity.email = user.email;
        userEntity.username = user.username;
        userEntity.firstName = user.firstName;
        userEntity.lastName = user.lastName;
        userEntity.userRole = user.userRole as UserRole;
        userEntity.countries = !user.countries
          ? await countryRepository.find()
          : await countryRepository.find({
              where: user.countries.map((countryCodeISO3: string): object => {
                return {
                  countryCodeISO3: countryCodeISO3,
                };
              }),
            });
        userEntity.disasterTypes = !user.disasterTypes
          ? []
          : await disasterRepository.find({
              where: user.disasterTypes.map((disasterType: string): object => {
                return {
                  disasterType: disasterType,
                };
              }),
            });
        userEntity.userStatus = user.userStatus as UserStatus;
        userEntity.password = user.password;
        return userEntity;
      }),
    );

    await userRepository.save(userEntities);

    // ***** CREATE AREAS OF FOCUS *****
    console.log('Seed Areas of Focus...');
    const areaOfFocusRepository =
      this.dataSource.getRepository(AreaOfFocusEntity);
    await areaOfFocusRepository.save(areasOfFocus);

    // ***** CREATE EAP ACTIONS *****
    console.log('Seed EAP Actions...');
    class EapAction {
      countryCodeISO3: string;
      disasterType: string;
      areaOfFocus: object;
      action: string;
      label: string;
      month?: object;
    }
    const filteredActions: EapAction[] = eapActions.filter(
      (action: EapAction): boolean => {
        return envCountries.includes(action.countryCodeISO3);
      },
    );
    const eapActionRepository = this.dataSource.getRepository(EapActionEntity);
    await eapActionRepository.save(filteredActions);

    // ***** CREATE INDICATOR METADATA *****
    console.log('Seed Indicators...');
    const indicatorRepository = this.dataSource.getRepository(
      IndicatorMetadataEntity,
    );
    await indicatorRepository.save(
      JSON.parse(JSON.stringify(indicatorMetadata)),
    );

    // ***** CREATE LAYER METADATA *****
    console.log('Seed Layers...');
    const layerRepository = this.dataSource.getRepository(LayerMetadataEntity);
    await layerRepository.save(JSON.parse(JSON.stringify(layerMetadata)));

    // ***** SEED POINT DATA *****
    console.log('Seed point data...');
    await this.seedPointData.run();

    // ***** SEED LINE DATA *****
    console.log('Seed line data...');
    await this.seedLineData.run();

    // ***** SEED INDICATOR DATA PER ADMIN AREA *****
    console.log('Seed Indicator data per admin-area...');
    await this.seedAdminAreaData.run();
  }
}

export default SeedInit;
