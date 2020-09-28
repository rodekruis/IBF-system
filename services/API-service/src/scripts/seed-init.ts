import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { USERCONFIGS, COUNTRYCONFIGS } from '../secrets';
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
  }
}

export default SeedInit;
