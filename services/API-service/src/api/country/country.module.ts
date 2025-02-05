import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { NotificationInfoEntity } from '../notification/notifcation-info.entity';
import { UserModule } from '../user/user.module';
import { CountryDisasterSettingsEntity } from './country-disaster.entity';
import { CountryController } from './country.controller';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      CountryEntity,
      DisasterTypeEntity,
      CountryDisasterSettingsEntity,
      NotificationInfoEntity,
    ]),
  ],
  providers: [CountryService],
  controllers: [CountryController],
  exports: [CountryService],
})
export class CountryModule {}
