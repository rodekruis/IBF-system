import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { CountryEntity } from '../country/country.entity';
import { LookupModule } from '../notification/lookup/lookup.module';
import { DisasterEntity } from '../disaster/disaster.entity';

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
