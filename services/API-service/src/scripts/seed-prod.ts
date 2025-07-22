import { Injectable, Logger } from '@nestjs/common';

import crypto from 'crypto';
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
      const user = users.filter(({ email }) => email === DUNANT_EMAIL)[0];

      const dunantUser = new UserEntity();
      dunantUser.email = user.email;
      dunantUser.firstName = user.firstName;
      dunantUser.lastName = user.lastName;
      dunantUser.userRole = user.userRole as UserRole;
      dunantUser.password = process.env.DUNANT_PASSWORD || user.password;

      this.logger.log('Create DUNANT user...');
      await userRepository.save(dunantUser);
    } else {
      this.logger.log('Users found in the database.');

      const dunantUser = await userRepository.findOne({
        where: { email: DUNANT_EMAIL },
      });

      if (dunantUser && process.env.DUNANT_PASSWORD) {
        // update password from env (hash it like @BeforeInsert does)
        const newPassword = process.env.DUNANT_PASSWORD;
        if (newPassword) {
          dunantUser.password = crypto
            .createHmac('sha256', newPassword)
            .digest('hex');

          this.logger.log('Updated existing DUNANT user password from env variable');
          await userRepository.save(dunantUser);
        }
      }
    }
  }
}

export default SeedProd;
