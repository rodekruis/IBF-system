import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryEntity } from '../country/country.entity';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';
import { GlofasStationController } from './glofas-station.controller';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      GlofasStationEntity,
      GlofasStationForecastEntity,
      AdminAreaEntity,
      AdminAreaDynamicDataEntity,
      CountryEntity,
    ]),
    EventModule,
  ],
  providers: [GlofasStationService, HelperService],
  controllers: [GlofasStationController],
  exports: [GlofasStationService],
})
export class GlofasStationModule {}
