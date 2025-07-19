import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import 'multer';
import { UserEntity } from '../api/user/user.entity';
import { UserRole } from '../api/user/user-role.enum';
import users from './json/users.json';
import { InterfaceScript } from './scripts.module';

@Injectable()
export class SeedProd implements InterfaceScript {
  private logger = new Logger('SeedProd');

  public constructor(private dataSource: DataSource) {}

  public async seed() {
    this.logger.log('Seed admin user...');

    const userRepository = this.dataSource.getRepository(UserEntity);

    if ((await userRepository.find({ take: 1 })).length === 0) {
      const user = users.filter((user): boolean => {
        return user.userRole === UserRole.Admin;
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

      // Always update dunant user password from env if it exists
      if (process.env.DUNANT_PASSWORD) {
        const user = users.filter((user): boolean => {
          return user.userRole === UserRole.Admin;
        })[0];

        const adminUser = await userRepository.findOne({
          where: { email: user.email },
        });

        if (adminUser) {
          adminUser.password = process.env.DUNANT_PASSWORD;
          await userRepository.save(adminUser);
          this.logger.log(
            'Admin user password updated from DUNANT_PASSWORD env variable.',
          );
        }
      }
    }
  }
}

export default SeedProd;
