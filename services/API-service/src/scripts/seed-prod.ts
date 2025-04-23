import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { UserRole } from '../api/user/user-role.enum';
import { UserEntity } from '../api/user/user.entity';
import users from './json/users.json';
import { InterfaceScript } from './scripts.module';

@Injectable()
export class SeedProd implements InterfaceScript {
  private logger = new Logger('SeedProd');

  public constructor(private dataSource: DataSource) {}

  public async run(): Promise<void> {
    this.logger.log('Seeding production data...');
    const userRepository = this.dataSource.getRepository(UserEntity);
    if ((await userRepository.find({ take: 1 })).length === 0) {
      const user = users.filter((user): boolean => {
        return user.userRole === UserRole.Admin;
      })[0];
      if (process.env.PRODUCTION_DATA_SERVER === 'yes') {
        user.password = process.env.ADMIN_PASSWORD;
      }

      const adminUser = new UserEntity();
      adminUser.email = user.email;
      adminUser.firstName = user.firstName;
      adminUser.lastName = user.lastName;
      adminUser.userRole = user.userRole as UserRole;
      adminUser.password = user.password;

      await userRepository.save(adminUser);
    } else {
      this.logger.log(
        '----------------NOTE: Users were found in database already, so admin-user not added------------------',
      );
    }
  }
}

export default SeedProd;
