import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { WhatsappModule } from '../notification/whatsapp/whatsapp.module';
import { WhatsappService } from '../notification/whatsapp/whatsapp.service';
import { UserModule } from '../user/user.module';
import { PointDataController } from './point-data.controller';
import { PointDataEntity } from './point-data.entity';
import { PointDataService } from './point-data.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([PointDataEntity]),
    WhatsappModule,
  ],
  providers: [PointDataService, HelperService],
  controllers: [PointDataController],
  exports: [PointDataService],
})
export class PointDataModule {}
