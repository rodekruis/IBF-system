import { EapActionStatusEntity } from './../api/eap-actions/eap-action-status.entity';
import { EventPlaceCodeEntity } from './../api/event/event-place-code.entity';
import { AdminAreaDynamicDataModule } from './../api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arguments } from 'yargs';
import { ScriptsController } from './scripts.controller';
import { SeedInit } from './seed-init';
import { GlofasStationModule } from '../api/glofas-station/glofas-station.module';
import { ScriptsService } from './scripts.service';
import { EventModule } from '../api/event/event.module';
import { UserModule } from '../api/user/user.module';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';
import { LeadTimeEntity } from '../api/lead-time/lead-time.entity';
import { CountryEntity } from '../api/country/country.entity';
import { TyphoonTrackModule } from '../api/typhoon-track/typhoon-track.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      migrations: [`src/migrations/*.{ts,js}`],
      entities: ['src/app/**/*.entity.{ts,js}'],
    }),
    TypeOrmModule.forFeature([
      EventPlaceCodeEntity,
      EapActionStatusEntity,
      AdminAreaEntity,
      LeadTimeEntity,
      CountryEntity,
    ]),
    AdminAreaDynamicDataModule,
    GlofasStationModule,
    EventModule,
    TyphoonTrackModule,
    UserModule,
  ],
  providers: [SeedInit, ScriptsService],
  controllers: [ScriptsController],
})
export class ScriptsModule {}

export interface InterfaceScript {
  run(argv: Arguments): Promise<void>;
}
