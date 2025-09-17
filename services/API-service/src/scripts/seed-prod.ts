import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import 'multer';
import { UserEntity } from '../api/user/user.entity';
import { DUNANT_EMAIL } from '../config';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedProd implements InterfaceScript {
  private readonly seedHelper: SeedHelper;
  private logger = new Logger('SeedProd');

  public constructor(private dataSource: DataSource) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async seed() {
    this.logger.log('Seed admin user...');

    const userRepository = this.dataSource.getRepository(UserEntity);

    if ((await userRepository.find({ take: 1 })).length === 0) {
      this.seedHelper.createDunantUser();
    } else {
      this.logger.log('Users found in the database.');

      const dunantUser = await userRepository.findOne({
        where: { email: DUNANT_EMAIL },
        relations: ['countries'],
      });

      if (dunantUser) {
        this.seedHelper.updateDunantUser(dunantUser);
      }
    }
  }
}

export default SeedProd;
