import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DataController } from './data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { DataService } from './data.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UserModule],
  providers: [DataService],
  controllers: [DataController],
  exports: [DataService],
})
export class DataModule {}
