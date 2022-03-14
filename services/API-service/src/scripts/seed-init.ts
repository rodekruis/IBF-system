import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminLevel } from '../api/country/admin-level.enum';
import { CountryStatus } from '../api/country/country-status.enum';
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
import { CountryDisasterSettingsEntity } from '../api/country/country-disaster.entity';

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
import { SeedHealthSites } from './seed-health-sites';
import { SeedDamData } from './seed-dam-data';
import SeedRedcrossBranches from './seed-redcross-branches';
import SeedAdminAreaData from './seed-admin-area-data';
import SeedRainfallData from './seed-rainfall-data';

@Injectable()
export class SeedInit implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;

  public constructor(connection: Connection) {
    this.connection = connection;
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

    const countryRepository = this.connection.getRepository(CountryEntity);
    const countryDisasterSettingsRepo = this.connection.getRepository(
      CountryDisasterSettingsEntity,
    );
    const envDisasterTypes = process.env.DISASTER_TYPES.split(',');

    const countryEntities = await Promise.all(
      selectedCountries.map(
        async (country): Promise<CountryEntity> => {
          const countryEntity = new CountryEntity();
          countryEntity.countryCodeISO3 = country.countryCodeISO3;
          countryEntity.countryCodeISO2 = country.countryCodeISO2;
          countryEntity.countryName = country.countryName;
          countryEntity.countryStatus = country.countryStatus as CountryStatus;
          countryEntity.adminRegionLabels = JSON.parse(
            JSON.stringify(country.adminRegionLabels),
          );
          countryEntity.disasterTypes = await disasterRepository.find({
            where: country.disasterTypes
              .filter(disasterType => envDisasterTypes.includes(disasterType))
              .map((countryDisasterType: string): object => {
                return { disasterType: countryDisasterType };
              }),
          });
          countryEntity.countryLogos = country.countryLogos;
          countryEntity.countryBoundingBox = country.countryBoundingBox;
          countryEntity.notificationInfo = await this.createNotificationInfo(
            country.countryCodeISO3,
          );
          countryEntity.countryDisasterSettings = [];

          await countryRepository.save(countryEntity);

          country.countryDisasterSettings.forEach(async disaster => {
            const countryDisasterSettingsEntity = new CountryDisasterSettingsEntity();
            countryDisasterSettingsEntity.country = await countryRepository.findOne(
              {
                where: { countryCodeISO3: country.countryCodeISO3 },
              },
            );
            countryDisasterSettingsEntity.disasterType = disaster.disasterType as DisasterType;
            countryDisasterSettingsEntity.adminLevels = disaster.adminLevels as AdminLevel[];
            countryDisasterSettingsEntity.defaultAdminLevel = disaster.defaultAdminLevel as AdminLevel;
            countryDisasterSettingsEntity.eapLink = disaster.eapLink;
            countryDisasterSettingsEntity.eapAlertClasses = JSON.parse(
              JSON.stringify([disaster.eapAlertClasses]),
            )[0];
            countryDisasterSettingsEntity.droughtForecastMonths = JSON.parse(
              JSON.stringify(disaster.droughtForecastMonths),
            );
            countryDisasterSettingsEntity.showMonthlyEapActions =
              disaster.showMonthlyEapActions;
            countryDisasterSettingsEntity.activeLeadTimes = await leadTimeRepository.find(
              {
                where: disaster.activeLeadTimes.map(
                  (countryLeadTime: string): object => {
                    return { leadTimeName: countryLeadTime };
                  },
                ),
              },
            );
            const saveResult = await countryDisasterSettingsRepo.save(
              countryDisasterSettingsEntity,
            );
            const savedEntity = await countryDisasterSettingsRepo.findOne(
              saveResult.countryDisasterSettingsId,
            );
            countryEntity.countryDisasterSettings.push(savedEntity);
          });

          return countryEntity;
        },
      ),
    );

    await countryRepository.save(countryEntities);

    // ***** SEED ADMIN-AREA DATA *****
    console.log('Seed Admin Areas...');
    const seedAdminArea = new SeedAdminArea(this.connection);
    await seedAdminArea.run();

    // ***** CREATE USERS *****
    console.log('Seed Users...');
    let selectedUsers;
    if (process.env.PRODUCTION_DATA_SERVER === 'yes') {
      selectedUsers = users.filter((user): boolean => {
        return user.userRole === UserRole.Admin;
      });
      selectedUsers[0].password = process.env.ADMIN_PASSWORD;
    } else {
      selectedUsers = users;
    }

    const userRepository = this.connection.getRepository(UserEntity);
    const userEntities = await Promise.all(
      selectedUsers.map(
        async (user): Promise<UserEntity> => {
          const userEntity = new UserEntity();
          userEntity.email = user.email;
          userEntity.username = user.username;
          userEntity.firstName = user.firstName;
          userEntity.lastName = user.lastName;
          userEntity.userRole = user.userRole as UserRole;
          userEntity.countries =
            user.userRole === UserRole.Admin
              ? await countryRepository.find()
              : await countryRepository.find({
                  where: user.countries.map(
                    (countryCodeISO3: string): object => {
                      return {
                        countryCodeISO3: countryCodeISO3,
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
    const filteredAction = eapActions.filter((action): boolean => {
      return envCountries.includes(action.countryCodeISO3);
    });
    const eapActionRepository = this.connection.getRepository(EapActionEntity);
    await eapActionRepository.save(filteredAction);

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

    // ***** SEED RED CROSS BRANCHES DATA *****
    console.log('Seed Red Cross branches...');
    const seedRedcrossBranches = new SeedRedcrossBranches(this.connection);
    await seedRedcrossBranches.run();

    // ***** SEED HEALTH SITES DATA *****
    console.log('Seed Health Sites...');
    const seedHealthSites = new SeedHealthSites(this.connection);
    await seedHealthSites.run();

    // ***** SEED DAM SITES DATA *****
    console.log('Seed Dam Sites...');
    const seedDamSites = new SeedDamData(this.connection);
    await seedDamSites.run();

    // ***** SEED INDICATOR DATA PER ADMIN AREA *****
    console.log('Seed Indicator data per admin-area...');
    const seedAdminAreaData = new SeedAdminAreaData(this.connection);
    await seedAdminAreaData.run();

    // ***** SEED RAINFALL DATA *****
    console.log('Seed rainfall data...');
    const seedRainfallData = new SeedRainfallData(this.connection);
    await seedRainfallData.run();

    // ***** SEED GLOFAS-STATION DATA *****
    console.log('Seed Glofas Stations...');
    const seedGlofasStation = new SeedGlofasStation(this.connection);
    await seedGlofasStation.run();
  }

  private async createNotificationInfo(
    countryCodeISO3: string,
  ): Promise<NotificationInfoEntity> {
    // ***** CREATE NOTIFICATION INFO *****
    const notificationInfoRepository = this.connection.getRepository(
      NotificationInfoEntity,
    );
    const notificationInfoEntity = new NotificationInfoEntity();
    const notificationInfoCountry = notificationInfo.find(
      (notificationInfoEntry): object => {
        if (notificationInfoEntry.countryCodeISO3 === countryCodeISO3) {
          return notificationInfoEntry;
        }
      },
    );
    if (!notificationInfoCountry) {
      return;
    }
    notificationInfoEntity.logo = notificationInfoCountry.logo;
    notificationInfoEntity.triggerStatement =
      notificationInfoCountry.triggerStatement;
    notificationInfoEntity.linkSocialMediaType =
      notificationInfoCountry.linkSocialMediaType;
    notificationInfoEntity.linkSocialMediaUrl =
      notificationInfoCountry.linkSocialMediaUrl;
    notificationInfoEntity.linkVideo = notificationInfoCountry.linkVideo;
    notificationInfoEntity.linkPdf = notificationInfoCountry.linkPdf;
    const saveResult = await notificationInfoRepository.save(
      notificationInfoEntity,
    );
    const savedEntity = await notificationInfoRepository.findOne(
      saveResult.notificationInfoId,
    );
    return savedEntity;
  }
}

export default SeedInit;
