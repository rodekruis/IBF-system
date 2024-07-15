import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { WhatsappModule } from '../notification/whatsapp/whatsapp.module';
import { UserModule } from '../user/user.module';
import { DynamicPointDataEntity } from './dynamic-point-data.entity';
import { PointDataController } from './point-data.controller';
import { PointDataEntity } from './point-data.entity';
import { PointDataService } from './point-data.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([PointDataEntity, DynamicPointDataEntity]),
    WhatsappModule,
  ],
  providers: [PointDataService, HelperService],
  controllers: [PointDataController],
  exports: [PointDataService],
})
export class PointDataModule {}
