import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { UserEntity } from '../api/user/user.entity';
import { EapActionEntity } from '../api/eap-actions/eap-action.entity';
import { CountryEntity } from '../api/country/country.entity';
import { AreaOfFocusEntity } from '../api/eap-actions/area-of-focus.entity';
import { IndicatorEntity } from '../api/indicator/indicator.entity';
import { CountryStatus } from '../api/country/country-status.enum';
import { UserRole } from '../api/user/user-role.enum';
import { UserStatus } from '../api/user/user-status.enum';

import areasOfFocus from './areas-of-focus.json';
import eapActions from './EAP-actions.json';
import indicators from './indicator-metadata.json';

const users = [
  {
    email: 'dunant@redcross.nl',
    username: 'dunant',
    firstName: 'Henry',
    lastName: 'Dunant',
    role: UserRole.Admin,
    password: 'password',
    status: UserStatus.Active,
    countries: ['UGA', 'ZMB', 'KEN', 'ETH'],
  },
  {
    email: 'uganda@redcross.nl',
    username: 'uganda',
    firstName: 'Uganda',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['UGA'],
  },
  {
    email: 'zambia@redcross.nl',
    username: 'zambia',
    firstName: 'Zambia',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['ZMB'],
  },
  {
    email: 'kenya@redcross.nl',
    username: 'kenya',
    firstName: 'Kenya',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['KEN'],
  },
  {
    email: 'ethiopia@redcross.nl',
    username: 'ethiopia',
    firstName: 'Ethiopia',
    lastName: 'Manager',
    role: UserRole.DisasterManager,
    password: 'password',
    status: UserStatus.Active,
    countries: ['ETH'],
  },
];

const countries = [
  {
    countryCode: 'UGA',
    countryName: 'Uganda',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'ZMB',
    countryName: 'Zambia',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'KEN',
    countryName: 'Kenya',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'ETH',
    countryName: 'Ethiopia',
    status: CountryStatus.Active,
  },
  {
    countryCode: 'EGY',
    countryName: 'Egypt',
    status: CountryStatus.Active,
  },
];

@Injectable()
export class SeedInit implements InterfaceScript {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async run(): Promise<void> {
    await this.connection.dropDatabase();
    await this.connection.synchronize(true);

    // ***** CREATE COUNTRIES *****

    const countryRepository = this.connection.getRepository(CountryEntity);
    const countryEntities = countries.map(
      (country): CountryEntity => {
        let countryEntity = new CountryEntity();
        countryEntity.countryCode = country.countryCode;
        countryEntity.countryName = country.countryName;
        countryEntity.status = country.status;
        return countryEntity;
      },
    );

    await countryRepository.save(countryEntities);

    // ***** CREATE ADMIN USER *****

    const userRepository = this.connection.getRepository(UserEntity);
    const userEntities = await Promise.all(
      users.map(
        async (user): Promise<UserEntity> => {
          let userEntity = new UserEntity();
          userEntity.email = user.email;
          userEntity.username = user.username;
          userEntity.firstName = user.firstName;
          userEntity.lastName = user.lastName;
          userEntity.role = user.role;
          userEntity.countries = await countryRepository.find({
            where: user.countries.map((countryCode: string): object => {
              return { countryCode: countryCode };
            }),
          });
          userEntity.status = user.status;
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
    await indicatorRepository.save(indicators);
  }
}

export default SeedInit;
