import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CountryModule } from '../country/country.module';
import { DisasterTypeModule } from '../disaster-type/disaster-type.module';
import { LookupModule } from '../notification/lookup/lookup.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { LoginController } from './login.controller';
import { LoginEntity } from './login.entity';
import { LoginService } from './login.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginEntity]),
    LookupModule,
    UserModule,
    CountryModule,
    DisasterTypeModule,
    NotificationModule,
  ],
  providers: [LoginService],
  controllers: [LoginController],
  exports: [LoginService],
})
export class LoginModule {}
