import { Module } from '@nestjs/common';
import { AdminAreaDynamicDataModule } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { EventModule } from '../api/event/event.module';
import { CronjobService } from './cronjob.service';

@Module({
  imports: [AdminAreaDynamicDataModule, EventModule],
  providers: [CronjobService],
  controllers: [],
  exports: [CronjobService],
})
export class CronjobModule {}
