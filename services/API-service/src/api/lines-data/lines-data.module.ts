import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { UserModule } from '../user/user.module';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';
import { LinesDataController } from './lines-data.controller';
import { LinesDataEntity } from './lines-data.entity';
import { LinesDataService } from './lines-data.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([LinesDataEntity, LinesDataDynamicStatusEntity]),
  ],
  providers: [LinesDataService, HelperService],
  controllers: [LinesDataController],
  exports: [LinesDataService],
})
export class LinesDataModule {}
