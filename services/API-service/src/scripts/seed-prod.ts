import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { UserEntity } from '../api/user/user.entity';
import users from './json/users.json';
import { UserRole } from '../api/user/user-role.enum';
import { UserStatus } from '../api/user/user-status.enum';

@Injectable()
export class SeedProd implements InterfaceScript {
  public constructor(private connection: Connection) {}

  public async run(): Promise<void> {
    const userRepository = this.connection.getRepository(UserEntity);
    if ((await userRepository.find({ take: 1 })).length === 0) {
      const user = users.filter((user): boolean => {
        return user.userRole === UserRole.Admin;
      })[0];
      if (process.env.PRODUCTION_DATA_SERVER === 'yes') {
        user.password = process.env.ADMIN_PASSWORD;
      }

      const adminUser = new UserEntity();
      adminUser.email = user.email;
      adminUser.username = user.username;
      adminUser.firstName = user.firstName;
      adminUser.lastName = user.lastName;
      adminUser.userRole = user.userRole as UserRole;
      adminUser.password = user.password;
      adminUser.userStatus = user.userStatus as UserStatus;

      await userRepository.save(adminUser);
    } else {
      console.log(
        '----------------NOTE: Users were found in database already, so admin-user not added------------------',
      );
    }
  }
}

export default SeedProd;
