import { CountryModule } from './../country/country.module';
import { UserModule } from '../user/user.module';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { AdminAreaDynamicDataController } from './admin-area-dynamic-data.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { EventModule } from '../event/event.module';
import { DisasterEntity } from '../disaster/disaster.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TriggerPerLeadTime,
      AdminAreaDynamicDataEntity,
      DisasterEntity,
    ]),
    UserModule,
    EventModule,
    CountryModule,
  ],
  providers: [AdminAreaDynamicDataService],
  controllers: [AdminAreaDynamicDataController],
  exports: [AdminAreaDynamicDataService],
})
export class AdminAreaDynamicDataModule {}
