import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminLevel } from '../api/country/admin-level.enum';
import { CountryStatus } from '../api/country/country-status.enum';
import { CountryEntity } from '../api/country/country.entity';
import { AreaOfFocusEntity } from '../api/eap-actions/area-of-focus.entity';
import { EapActionEntity } from '../api/eap-actions/eap-action.entity';
import { IndicatorEntity } from '../api/indicator/indicator.entity';
import { leadTimeStatus } from '../api/lead-time/lead-time-status.enum';
import { LeadTimeEntity } from '../api/lead-time/lead-time.entity';
import { UserRole } from '../api/user/user-role.enum';
import { UserStatus } from '../api/user/user-status.enum';
import { UserEntity } from '../api/user/user.entity';

import leadTimes from './json/lead-times.json';
import countries from './json/countries.json';
import users from './json/users.json';
import areasOfFocus from './json/areas-of-focus.json';
import eapActions from './json/EAP-actions.json';
import indicators from './json/indicator-metadata.json';

import SeedAdminArea from './seed-admin-area';
import SeedGlofasStation from './seed-glofas-station';

@Injectable()
export class SeedInit implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    await this.cleanAll();
    await this.connection.synchronize(false);

    // ***** CREATE LEAD TIMES *****

    const leadTimeRepository = this.connection.getRepository(LeadTimeEntity);
    const leadTimeEntities = leadTimes.map(
      (leadTime): LeadTimeEntity => {
        let leadTimeEntity = new LeadTimeEntity();
        leadTimeEntity.leadTimeName = leadTime.leadTimeName;
        leadTimeEntity.leadTimeLabel = leadTime.leadTimeLabel;
        leadTimeEntity.leadTimeStatus = leadTime.leadTimeStatus as leadTimeStatus;
        return leadTimeEntity;
      },
    );

    await leadTimeRepository.save(leadTimeEntities);

    // ***** CREATE COUNTRIES *****
    const envCountries = process.env.COUNTRIES.split(',');
    const selectedCountries = countries.filter((country): boolean => {
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
          countryEntity.countryLeadTimes = await leadTimeRepository.find({
            where: country.countryLeadTimes.map(
              (countryLeadTime: string): object => {
                return { leadTimeName: countryLeadTime };
              },
            ),
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
    let selectedUsers;
    if (process.env.NODE_ENV === 'production') {
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
          userEntity.countries = await countryRepository.find({
            where: user.countries.map((countryCodeISO3: string): object => {
              return { countryCodeISO3: countryCodeISO3 };
            }),
          });
          userEntity.userStatus = user.userStatus as UserStatus;
          userEntity.password = user.password;
          return userEntity;
        },
      ),
    );

    await userRepository.save(userEntities);

    // ***** CREATE AREAS OF FOCUS *****

    const areaOfFocusRepository = this.connection.getRepository(
      AreaOfFocusEntity,
    );
    await areaOfFocusRepository.save(areasOfFocus);

    // ***** CREATE EAP ACTIONS *****
    const eapActionRepository = this.connection.getRepository(EapActionEntity);
    await eapActionRepository.save(eapActions);

    // ***** CREATE INDICATORS *****
    const indicatorRepository = this.connection.getRepository(IndicatorEntity);
    await indicatorRepository.save(JSON.parse(JSON.stringify(indicators)));

    // // ***** SEED ADMIN-AREA DATA *****
    const seedAdminArea = await new SeedAdminArea(this.connection);
    await seedAdminArea.run();

    // ***** SEED GLOFAS-STATION DATA *****
    const seedGlofasStation = await new SeedGlofasStation(this.connection);
    await seedGlofasStation.run();
  }

  private async cleanAll(): Promise<void> {
    const entities = this.connection.entityMetadatas;
    try {
      for (const entity of entities) {
        const repository = await this.connection.getRepository(entity.name);
        if (repository.metadata.schema === 'IBF-app') {
          const q = `DROP TABLE \"${repository.metadata.schema}\".\"${entity.tableName}\" CASCADE;`;
          console.log(q);
          await repository.query(q);
        }
      }
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
  }
}

export default SeedInit;
