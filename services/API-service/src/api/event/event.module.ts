import { EventPcodeEntity } from './event-pcode.entity';
import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([EventPcodeEntity])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
