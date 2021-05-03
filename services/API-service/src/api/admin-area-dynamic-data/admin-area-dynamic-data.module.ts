import { UserModule } from '../user/user.module';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { AdminAreaDynamicDataController } from './admin-area-dynamic-data.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculatedAffectedEntity } from './calculated-affected.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TriggerPerLeadTime,
      CalculatedAffectedEntity,
      AdminAreaDynamicDataEntity,
    ]),
    UserModule,
  ],
  controllers: [AdminAreaDynamicDataController],
  providers: [AdminAreaDynamicDataService],
})
export class AdminAreaDynamicDataModule {}
