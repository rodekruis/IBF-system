import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import 'multer';
import { UserService } from '../api/user/user.service';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedProd implements InterfaceScript {
  private readonly seedHelper: SeedHelper;
  private logger = new Logger('SeedProd');

  public constructor(
    dataSource: DataSource,
    private userService: UserService,
  ) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async seed() {
    this.logger.log('Seed admin user...');
    this.seedHelper.upsertDunantUser(this.userService);
  }
}

export default SeedProd;
