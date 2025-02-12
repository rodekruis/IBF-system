import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { UserModule } from '../user/user.module';
import { TyphoonTrackController } from './typhoon-track.controller';
import { TyphoonTrackEntity } from './typhoon-track.entity';
import { TyphoonTrackService } from './typhoon-track.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([TyphoonTrackEntity]),
  ],
  providers: [TyphoonTrackService, HelperService],
  controllers: [TyphoonTrackController],
  exports: [TyphoonTrackService],
})
export class TyphoonTrackModule {}
