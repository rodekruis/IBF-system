import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { DisasterTypeController } from './disaster-type.controller';
import { DisasterTypeEntity } from './disaster-type.entity';
import { DisasterTypeService } from './disaster-type.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([DisasterTypeEntity]),
  ],
  providers: [DisasterTypeService],
  controllers: [DisasterTypeController],
  exports: [DisasterTypeService],
})
export class DisasterTypeModule {}
