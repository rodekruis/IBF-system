import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LookupModule } from '../notification/lookup/lookup.module';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CountryEntity, DisasterEntity]),
    LookupModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
