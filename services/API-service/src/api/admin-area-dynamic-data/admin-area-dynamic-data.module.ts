import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminAreaModule } from '../admin-area/admin-area.module';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { CountryModule } from './../country/country.module';
import { AdminAreaDynamicDataController } from './admin-area-dynamic-data.controller';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminAreaDynamicDataEntity]),
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
