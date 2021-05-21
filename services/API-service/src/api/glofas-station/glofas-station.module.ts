import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { UserModule } from '../user/user.module';
import { GlofasStationTriggerEntity } from './glofas-station-trigger.entity';
import { GlofasStationController } from './glofas-station.controller';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      GlofasStationEntity,
      GlofasStationTriggerEntity,
      AdminAreaEntity,
      AdminAreaDynamicDataEntity,
    ]),
  ],
  providers: [GlofasStationService],
  controllers: [GlofasStationController],
  exports: [GlofasStationService],
})
export class GlofasStationModule {}
