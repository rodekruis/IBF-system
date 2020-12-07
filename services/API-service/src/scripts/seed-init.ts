import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { EapActionEntity } from '../eap-actions/eap-action.entity';
import { USERCONFIGS, COUNTRYCONFIGS } from '../secrets';
import { CountryEntity } from '../country/country.entity';
import { AreaOfFocusEntity } from '../eap-actions/area-of-focus.entity';

import eapActions from '../../seed-data/EAP-actions.json';

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
    const countryEntities = COUNTRYCONFIGS.map(
      (countryConfig): CountryEntity => {
        let countryEntity = new CountryEntity();
        countryEntity.countryCode = countryConfig.countryCode;
        countryEntity.countryName = countryConfig.countryName;
        countryEntity.status = countryConfig.status;
        return countryEntity;
      },
    );

    await countryRepository.save(countryEntities);

    // ***** CREATE ADMIN USER *****

    const userRepository = this.connection.getRepository(UserEntity);
    const userEntities = await Promise.all(
      USERCONFIGS.map(
        async (userConfig): Promise<UserEntity> => {
          let userEntity = new UserEntity();
          userEntity.email = userConfig.email;
          userEntity.username = userConfig.username;
          userEntity.firstName = userConfig.firstName;
          userEntity.lastName = userConfig.lastName;
          userEntity.role = userConfig.role;
          userEntity.countries = await countryRepository.find({
            where: userConfig.countries.map((countryCode: string): object => {
              return { countryCode: countryCode };
            }),
          });
          userEntity.status = userConfig.status;
          userEntity.password = userConfig.password;
          return userEntity;
        },
      ),
    );

    await userRepository.save(userEntities);

    // ***** CREATE AREAS OF FOCUS *****

    const areaOfFocusRepository = this.connection.getRepository(
      AreaOfFocusEntity,
    );
    await areaOfFocusRepository.save([
      {
        id: 'drr',
        label: 'Disaster Risk Reduction',
        icon: 'Shelter.svg',
      },
      {
        id: 'shelter',
        label: 'Shelter',
        icon: 'Shelter.svg',
      },
      {
        id: 'livelihood',
        label: 'Livelihoods & Basic Needs',
        icon: 'Livelihood.svg',
      },
      {
        id: 'health',
        label: 'Health',
        icon: 'Health.svg',
      },
      {
        id: 'wash',
        label: 'WASH',
        icon: 'Water-Sanitation-and-Hygiene.svg',
      },
      {
        id: 'inclusion',
        label: 'Inclusion, Gender & Protection',
        icon: 'Gender.svg',
      },
      {
        id: 'migration',
        label: 'Migration',
        icon: 'Internally-displaced.svg',
      },
    ]);

    // ***** CREATE EAP ACTIONS *****
    const eapActionRepository = this.connection.getRepository(EapActionEntity);
    await eapActionRepository.save(eapActions);
  }
}

export default SeedInit;
