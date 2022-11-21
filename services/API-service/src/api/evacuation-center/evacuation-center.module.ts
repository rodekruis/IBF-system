import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { UserModule } from '../user/user.module';
import { EvacuationCenterController } from './evacuation-center.controller';
import { EvacuationCenterEntity } from './evacuation-center.entity';
import { EvacuationCenterService } from './evacuation-center.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([EvacuationCenterEntity]),
  ],
  providers: [EvacuationCenterService, HelperService],
  controllers: [EvacuationCenterController],
  exports: [EvacuationCenterService],
})
export class EvacuationCenterModule {}
