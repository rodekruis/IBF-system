import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import 'multer';
import { CountryEntity } from '../api/country/country.entity';
import { UserEntity } from '../api/user/user.entity';
import { UserRole } from '../api/user/user-role.enum';
import { DUNANT_EMAIL } from '../config';
import users from './json/users.json';
import { InterfaceScript } from './scripts.module';

@Injectable()
export class SeedProd implements InterfaceScript {
  private logger = new Logger('SeedProd');

  public constructor(private dataSource: DataSource) {}

  public async seed() {
    this.logger.log('Seed admin user...');

    const userRepository = this.dataSource.getRepository(UserEntity);
    const countryRepository = this.dataSource.getRepository(CountryEntity);

    if ((await userRepository.find({ take: 1 })).length === 0) {
      const user = users.filter((user): boolean => {
        return user.email === DUNANT_EMAIL;
      })[0];

      const adminUser = new UserEntity();
      adminUser.email = user.email;
      adminUser.firstName = user.firstName;
      adminUser.lastName = user.lastName;
      adminUser.userRole = user.userRole as UserRole;
      adminUser.password = process.env.DUNANT_PASSWORD || user.password;

      await userRepository.save(adminUser);
    } else {
      this.logger.log(
        'Users already exist, updating admin user password from env...',
      );

      // Always update dunant user password and countries from env if it exists
      const dunantUser = await userRepository.findOne({
        where: { email: DUNANT_EMAIL },
      });

      if (dunantUser) {
        // Update countries similar to seed-init
        dunantUser.countries = await countryRepository.find();
        
        // Update password from env if available
        if (process.env.DUNANT_PASSWORD) {
          dunantUser.password = process.env.DUNANT_PASSWORD;
          this.logger.log(
            'Updated existing DUNANT user password from env variable',
          );
        }
        
        await userRepository.save(dunantUser);
      }
    }
  }
}

export default SeedProd;
