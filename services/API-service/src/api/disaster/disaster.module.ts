import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { DisasterController } from './disaster.controller';
import { DisasterEntity } from './disaster.entity';
import { DisasterService } from './disaster.service';

@Module({
  imports: [HttpModule, UserModule, TypeOrmModule.forFeature([DisasterEntity])],
  providers: [DisasterService],
  controllers: [DisasterController],
  exports: [DisasterService],
})
export class DisasterModule {}
