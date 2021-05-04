import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { RainfallTriggersController } from './rainfall-triggers.controller';
import { RainfallTriggersEntity } from './rainfall-triggers.entity';
import { RainfallTriggersService } from './rainfall-triggers.service';

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
