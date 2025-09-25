import { Injectable, Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import 'multer';
import { InterfaceScript } from './scripts.module';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedProd implements InterfaceScript {
  private readonly seedHelper: SeedHelper;
  private logger = new Logger('SeedProd');

  public constructor(dataSource: DataSource) {
    this.seedHelper = new SeedHelper(dataSource);
  }

  public async seed() {
    this.logger.log('Seed admin user...');
    this.seedHelper.upsertDunantUser();
  }
}

export default SeedProd;
