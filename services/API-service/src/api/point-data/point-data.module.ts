import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { WhatsappModule } from '../notification/whatsapp/whatsapp.module';
import { UserModule } from '../user/user.module';
import { PointDataController } from './point-data.controller';
import { PointDataEntity } from './point-data.entity';
import { PointDataService } from './point-data.service';
import { HttpModule } from '@nestjs/axios';
import { DynamicPointDataEntity } from './dynamic-point-data.entity';

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
