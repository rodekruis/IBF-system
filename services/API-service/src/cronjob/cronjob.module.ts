import { Module } from '@nestjs/common';
import { AdminAreaDynamicDataModule } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { CronjobService } from './cronjob.service';

@Module({
  imports: [AdminAreaDynamicDataModule],
  providers: [CronjobService],
  controllers: [],
  exports: [CronjobService],
})
export class CronjobModule {}
