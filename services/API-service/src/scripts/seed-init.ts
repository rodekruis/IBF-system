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

import leadTimes from './json/lead-times.json';
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
import { SeedRedcrossBranches } from './seed-redcross-branches';
import SeedAdminAreaData from './seed-admin-area-data';
import { SeedHealthSites } from './seed-health-sites';

@Injectable()
export class SeedInit implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    await this.seedHelper.cleanAll();
    await this.connection.synchronize(false);

    // ***** CREATE DISASTER *****
    console.log('Seed Disasters...');
    const disasterRepository = this.connection.getRepository(DisasterEntity);
    const disasterEntities = disasters.map(
      (disaster): DisasterEntity => {
        let disasterEntity = new DisasterEntity();
        disasterEntity.disasterType = disaster.disasterType as DisasterType;
        disasterEntity.label = disaster.label;
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
          let leadTimeEntity = new LeadTimeEntity();
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
    console.log('Seed Countries...');
    const envCountries = process.env.COUNTRIES.split(',');
    const selectedCountries = countries.filter((country): boolean => {
      console.log(`Seeding country ${country.countryCodeISO3}`);
      return envCountries.includes(country.countryCodeISO3);
    });

    const countryRepository = this.connection.getRepository(CountryEntity);
    const countryEntities = await Promise.all(
      selectedCountries.map(
        async (country): Promise<CountryEntity> => {
          let countryEntity = new CountryEntity();
          countryEntity.countryCodeISO3 = country.countryCodeISO3;
          countryEntity.countryCodeISO2 = country.countryCodeISO2;
          countryEntity.countryName = country.countryName;
          countryEntity.countryStatus = country.countryStatus as CountryStatus;
          countryEntity.defaultAdminLevel = country.defaultAdminLevel as AdminLevel;
          countryEntity.adminRegionLabels = country.adminRegionLabels;
          countryEntity.eapLink = country.eapLink;
          countryEntity.countryActiveLeadTimes = await leadTimeRepository.find({
            where: country.countryActiveLeadTimes.map(
              (countryLeadTime: string): object => {
                return { leadTimeName: countryLeadTime };
              },
            ),
          });
          countryEntity.disasterTypes = await disasterRepository.find({
            where: { disasterType: country.disasterType },
          });
          countryEntity.countryLogos = country.countryLogos;
          countryEntity.eapAlertClasses = JSON.parse(
            JSON.stringify([country.eapAlertClasses]),
          )[0];
          countryEntity.countryBoundingBox = country.countryBoundingBox;
          return countryEntity;
        },
      ),
    );

    await countryRepository.save(countryEntities);

    // ***** CREATE USERS *****
    console.log('Seed Users...');
    let selectedUsers;
    if (process.env.PRODUCTION_DATA_SERVER === 'yes') {
      selectedUsers = users.filter((user): boolean => {
        return user.userRole === 'admin';
      });
      selectedUsers[0].password = process.env.ADMIN_PASSWORD;
    } else {
      selectedUsers = users;
    }

    const userRepository = this.connection.getRepository(UserEntity);
    const userEntities = await Promise.all(
      selectedUsers.map(
        async (user): Promise<UserEntity> => {
          let userEntity = new UserEntity();
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
                      return { countryCodeISO3: countryCodeISO3 };
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
    const eapActionRepository = this.connection.getRepository(EapActionEntity);
    await eapActionRepository.save(eapActions);

    // ***** CREATE INDICATOR METADATA *****
    console.log('Seed Indicators...');
    const indicatorRepository = this.connection.getRepository(
      IndicatorMetadataEntity,
    );
    await indicatorRepository.save(
      JSON.parse(JSON.stringify(indicatorMetadata)),
    );

    // ***** CREATE LAYER METADATA *****
    console.log('Seed Layers...');
    const layerRepository = this.connection.getRepository(LayerMetadataEntity);
    await layerRepository.save(JSON.parse(JSON.stringify(layerMetadata)));

    // ***** SEED ADMIN-AREA DATA *****
    console.log('Seed Admin Areas...');
    const seedAdminArea = new SeedAdminArea(this.connection);
    await seedAdminArea.run();

    // ***** SEED GLOFAS-STATION DATA *****
    console.log('Seed Glofas Stations...');
    const seedGlofasStation = new SeedGlofasStation(this.connection);
    await seedGlofasStation.run();

    // ***** SEED RED CROSS BRANCHES DATA *****
    console.log('Seed Red Cross branches...');
    const seedRedcrossBranches = new SeedRedcrossBranches(this.connection);
    await seedRedcrossBranches.run();

    // ***** SEED RED CROSS BRANCHES DATA *****
    console.log('Seed Health Sites...');
    const seedHealthSites = new SeedHealthSites(this.connection);
    await seedHealthSites.run();

    // ***** SEED INDICATOR DATA PER ADMIN AREa *****
    console.log('Seed Indicator data per admin-area...');
    const seedAdminAreaData = new SeedAdminAreaData(this.connection);
    await seedAdminAreaData.run();

    // ***** RUN SCRIPT TO FINALIZE ALL DATA PREPARATION *****
    console.log('Run IBF-database-scripts.sql...');
    await this.seedHelper.runSqlScript('./src/sql/IBF-database-scripts.sql');
  }
}

export default SeedInit;
