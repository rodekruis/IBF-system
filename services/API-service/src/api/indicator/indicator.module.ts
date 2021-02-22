import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from '../data/data.module';
import { UserModule } from '../user/user.module';
import { IndicatorController } from './indicator.controller';
import { IndicatorEntity } from './indicator.entity';
import { IndicatorService } from './indicator.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([IndicatorEntity]),
    DataModule,
  ],
  providers: [IndicatorService],
  controllers: [IndicatorController],
  exports: [IndicatorService],
})
export class IndicatorModule {}
