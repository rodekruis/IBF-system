import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { USERCONFIG, COUNTRYCONFIGS } from '../secrets';
import { CountryEntity } from '../country/country.entity';

@Injectable()
export class SeedInit implements InterfaceScript {
  public constructor(private connection: Connection) {}

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

    let defaultUser = new UserEntity();
    defaultUser.email = USERCONFIG.email;
    defaultUser.username = USERCONFIG.username;
    defaultUser.firstName = USERCONFIG.firstName;
    defaultUser.lastName = USERCONFIG.lastName;
    defaultUser.role = USERCONFIG.role;
    defaultUser.countries = await countryRepository.find();
    defaultUser.status = USERCONFIG.status;
    defaultUser.password = USERCONFIG.password;

    await userRepository.save(defaultUser);
  }
}

export default SeedInit;
