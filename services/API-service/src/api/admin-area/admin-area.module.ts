import { CountryModule } from './../country/country.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { CountryEntity } from '../country/country.entity';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { AdminAreaController } from './admin-area.controller';
import { AdminAreaEntity } from './admin-area.entity';
import { AdminAreaService } from './admin-area.service';
import { DisasterEntity } from '../disaster/disaster.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      AdminAreaEntity,
      CountryEntity,
      DisasterEntity,
      AdminAreaDynamicDataEntity,
    ]),
    EventModule,
    CountryModule,
  ],
  providers: [AdminAreaService, HelperService],
  controllers: [AdminAreaController],
  exports: [AdminAreaService],
})
export class AdminAreaModule {}
