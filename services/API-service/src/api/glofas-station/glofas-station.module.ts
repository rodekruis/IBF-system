import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryEntity } from '../country/country.entity';
import { EventModule } from '../event/event.module';
import { PointDataModule } from '../point-data/point-data.module';
import { UserModule } from '../user/user.module';
import { GlofasStationController } from './glofas-station.controller';
import { GlofasStationService } from './glofas-station.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      AdminAreaEntity,
      AdminAreaDynamicDataEntity,
      CountryEntity,
    ]),
    EventModule,
    PointDataModule,
  ],
  providers: [GlofasStationService, HelperService],
  controllers: [GlofasStationController],
  exports: [GlofasStationService],
})
export class GlofasStationModule {}
