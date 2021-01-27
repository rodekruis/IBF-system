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

import leadTimes from './lead-times.json';
import countries from './countries.json';
import users from './users.json';
import areasOfFocus from './areas-of-focus.json';
import eapActions from './EAP-actions.json';
import indicators from './indicator-metadata.json';

@Injectable()
export class SeedInit implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    await this.connection.dropDatabase();
    await this.connection.synchronize(true);

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

    const countryRepository = this.connection.getRepository(CountryEntity);
    const countryEntities = await Promise.all(
      countries.map(
        async (country): Promise<CountryEntity> => {
          let countryEntity = new CountryEntity();
          countryEntity.countryCode = country.countryCode;
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
          return countryEntity;
        },
      ),
    );

    await countryRepository.save(countryEntities);

    // ***** CREATE USERS *****

    const userRepository = this.connection.getRepository(UserEntity);
    const userEntities = await Promise.all(
      users.map(
        async (user): Promise<UserEntity> => {
          let userEntity = new UserEntity();
          userEntity.email = user.email;
          userEntity.username = user.username;
          userEntity.firstName = user.firstName;
          userEntity.lastName = user.lastName;
          userEntity.userRole = user.userRole as UserRole;
          userEntity.countries = await countryRepository.find({
            where: user.countries.map((countryCode: string): object => {
              return { countryCode: countryCode };
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
  }
}

export default SeedInit;
