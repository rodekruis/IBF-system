import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { DataService } from './data.service';
import { UserModule } from '../user/user.module';
import { TriggerPerLeadTime } from '../upload/trigger-per-lead-time.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TriggerPerLeadTime]),
    UserModule,
  ],
  providers: [DataService],
  controllers: [DataController],
  exports: [DataService],
})
export class DataModule {}
