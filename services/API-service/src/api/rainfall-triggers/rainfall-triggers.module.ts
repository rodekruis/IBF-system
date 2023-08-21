import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { RainfallTriggersController } from './rainfall-triggers.controller';
import { RainfallTriggersEntity } from './rainfall-triggers.entity';
import { RainfallTriggersService } from './rainfall-triggers.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([RainfallTriggersEntity]),
  ],
  providers: [RainfallTriggersService],
  controllers: [RainfallTriggersController],
  exports: [RainfallTriggersService],
})
export class RainfallTriggersModule {}
