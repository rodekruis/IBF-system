import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminAreaModule } from '../admin-area/admin-area.module';
import { CountryEntity } from '../country/country.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { EventModule } from '../event/event.module';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { UserModule } from '../user/user.module';
import { CountryModule } from './../country/country.module';
import { AdminAreaDynamicDataController } from './admin-area-dynamic-data.controller';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TriggerPerLeadTime,
      AdminAreaDynamicDataEntity,
      DisasterEntity,
      CountryEntity,
    ]),
    UserModule,
    EventModule,
    CountryModule,
    AdminAreaModule,
  ],
  providers: [AdminAreaDynamicDataService, HelperService],
  controllers: [AdminAreaDynamicDataController],
  exports: [AdminAreaDynamicDataService],
})
export class AdminAreaDynamicDataModule {}
