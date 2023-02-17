import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { CountryEntity } from '../api/country/country.entity';
import { AreaOfFocusEntity } from '../api/eap-actions/area-of-focus.entity';
import { EapActionEntity } from '../api/eap-actions/eap-action.entity';
import { IndicatorMetadataEntity } from '../api/metadata/indicator-metadata.entity';
import { LeadTimeEntity } from '../api/lead-time/lead-time.entity';
import { UserRole } from '../api/user/user-role.enum';
import { UserStatus } from '../api/user/user-status.enum';
import { UserEntity } from '../api/user/user.entity';
import { LayerMetadataEntity } from '../api/metadata/layer-metadata.entity';
import { DisasterType } from '../api/disaster/disaster-type.enum';
import { DisasterEntity } from '../api/disaster/disaster.entity';
import { NotificationInfoEntity } from '../api/notification/notifcation-info.entity';

import leadTimes from './json/lead-times.json';
import notificationInfo from './json/notification-info.json';
import countries from './json/countries.json';
import users from './json/users.json';
import areasOfFocus from './json/areas-of-focus.json';
import eapActions from './json/EAP-actions.json';
import indicatorMetadata from './json/indicator-metadata.json';
import layerMetadata from './json/layer-metadata.json';
import disasters from './json/disasters.json';

import SeedAdminArea from './seed-admin-area';
import SeedGlofasStation from './seed-glofas-station';
import { SeedHelper } from './seed-helper';
import SeedAdminAreaData from './seed-admin-area-data';
import SeedRainfallData from './seed-rainfall-data';
import SeedPointData from './seed-point-data';
import { CountryService } from '../api/country/country.service';
import { NotificationInfoDto } from '../api/country/dto/notification-info.dto';

@Injectable()
export class SeedInit implements InterfaceScript {
  private readonly seedHelper: SeedHelper;

  public constructor(
    private connection: Connection,
    private seedAdminArea: SeedAdminArea,
    private seedAdminAreaData: SeedAdminAreaData,
    private seedGlofasStation: SeedGlofasStation,
    private seedPointData: SeedPointData,
    private seedRainfallData: SeedRainfallData,
    private countryService: CountryService,
  ) {
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    await this.seedHelper.truncateAll();

    // ***** CREATE DISASTER *****
    console.log('Seed Disasters...');
    const disasterRepository = this.connection.getRepository(DisasterEntity);
    const disasterEntities = disasters.map(
      (disaster): DisasterEntity => {
        const disasterEntity = new DisasterEntity();
        disasterEntity.disasterType = disaster.disasterType as DisasterType;
        disasterEntity.label = disaster.label;
        disasterEntity.triggerUnit = disaster.triggerUnit;
        disasterEntity.actionsUnit = disaster.actionsUnit;
        return disasterEntity;
      },
    );

    await disasterRepository.save(disasterEntities);

    // ***** CREATE LEAD TIMES *****
    console.log('Seed Lead Times...');
    const leadTimeRepository = this.connection.getRepository(LeadTimeEntity);

    const leadTimeEntities = await Promise.all(
      leadTimes.map(
        async (leadTime): Promise<LeadTimeEntity> => {
          const leadTimeEntity = new LeadTimeEntity();
          leadTimeEntity.leadTimeName = leadTime.leadTimeName;
          leadTimeEntity.leadTimeLabel = leadTime.leadTimeLabel;
          leadTimeEntity.disasterTypes = await disasterRepository.find({
            where: leadTime.disasterTypes.map((diasterType: string): object => {
              return { disasterType: diasterType };
            }),
          });
          return leadTimeEntity;
        },
      ),
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

    const countryRepository = this.connection.getRepository(CountryEntity);
    const countryEntities = [];
    for await (const countryEntity of await countryRepository.find()) {
      const notificationInfoEntity = new NotificationInfoEntity();
      const notificationInfoCountry: NotificationInfoDto = notificationInfo.find(
        (notificationInfoEntry): NotificationInfoDto => {
          if (
            notificationInfoEntry.countryCodeISO3 ===
            countryEntity.countryCodeISO3
          ) {
            return notificationInfoEntry;
          }
        },
      );
      countryEntity.notificationInfo = await this.countryService.createNotificationInfo(
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
    const userRepository = this.connection.getRepository(UserEntity);

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
        selectedUsers = users.filter(user => user.username !== 'dunant');
        dunantUser.countries = await countryRepository.find();
        await userRepository.save(dunantUser);
      } else {
        selectedUsers = users;
      }
    }

    const userEntities = await Promise.all(
      selectedUsers.map(
        async (user): Promise<UserEntity> => {
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
                where: user.disasterTypes.map(
                  (disasterType: string): object => {
                    return {
                      disasterType: disasterType,
                    };
                  },
                ),
              });
          userEntity.userStatus = user.userStatus as UserStatus;
          userEntity.password = user.password;
          return userEntity;
        },
      ),
    );

    await userRepository.save(userEntities);

    // ***** CREATE AREAS OF FOCUS *****
    console.log('Seed Areas of Focus...');
    const areaOfFocusRepository = this.connection.getRepository(
      AreaOfFocusEntity,
    );
    await areaOfFocusRepository.save(areasOfFocus);

    // ***** CREATE EAP ACTIONS *****
    console.log('Seed EAP Actions...');
    class EapAction {
      countryCodeISO3: string;
      disasterType: string;
      areaOfFocus: {};
      action: string;
      label: string;
      month?: {};
    }
    const filteredActions: EapAction[] = eapActions.filter(
      (action: EapAction): boolean => {
        return envCountries.includes(action.countryCodeISO3);
      },
    );
    const eapActionRepository = this.connection.getRepository(EapActionEntity);
    await eapActionRepository.save(filteredActions);

    // ***** CREATE INDICATOR METADATA *****
    console.log('Seed Indicators...');
    const indicatorRepository = this.connection.getRepository(
      IndicatorMetadataEntity,
    );
    const indicators = JSON.parse(JSON.stringify(indicatorMetadata));
    const indicatorEntities = await Promise.all(
      indicators.map(
        async (indicator): Promise<IndicatorMetadataEntity> => {
          indicator.disasterTypes = await disasterRepository.find({
            where: indicator.disasterTypes.map(
              (indicatorDisasterType: string): object => {
                return { disasterType: indicatorDisasterType };
              },
            ),
          });
          return indicator;
        },
      ),
    );

    await indicatorRepository.save(indicatorEntities);

    // ***** CREATE LAYER METADATA *****
    console.log('Seed Layers...');
    const layerRepository = this.connection.getRepository(LayerMetadataEntity);

    const layers = JSON.parse(JSON.stringify(layerMetadata));
    const layerEntities = await Promise.all(
      layers.map(
        async (layer): Promise<LayerMetadataEntity> => {
          layer.disasterTypes = await disasterRepository.find({
            where: layer.disasterTypes.map(
              (layerDisasterType: string): object => {
                return { disasterType: layerDisasterType };
              },
            ),
          });
          return layer;
        },
      ),
    );
    await layerRepository.save(layerEntities);

    // ***** SEED POINT DATA *****
    console.log('Seed point data...');
    await this.seedPointData.run();

    // ***** SEED INDICATOR DATA PER ADMIN AREA *****
    console.log('Seed Indicator data per admin-area...');
    await this.seedAdminAreaData.run();

    // ***** SEED RAINFALL DATA *****
    console.log('Seed rainfall data...');
    await this.seedRainfallData.run();

    // ***** SEED GLOFAS-STATION DATA *****
    console.log('Seed Glofas Stations...');
    await this.seedGlofasStation.run();
  }
}

export default SeedInit;
