import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { WhatsappModule } from '../notification/whatsapp/whatsapp.module';
import { UserModule } from '../user/user.module';
import { PointDataController } from './point-data.controller';
import { PointDataEntity } from './point-data.entity';
import { PointDataService } from './point-data.service';
import { PointDataDynamicStatusEntity } from './point-data-dynamic-status.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([PointDataEntity, PointDataDynamicStatusEntity]),
    WhatsappModule,
  ],
  providers: [PointDataService, HelperService],
  controllers: [PointDataController],
  exports: [PointDataService],
})
export class PointDataModule {}
