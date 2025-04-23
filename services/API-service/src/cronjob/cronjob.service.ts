import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AdminAreaDynamicDataService } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.service';

@Injectable()
export class CronjobService {
  private logger = new Logger('CronjobService');

  public constructor(
    private adminAreaDynamicDataService: AdminAreaDynamicDataService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron(CronExpression.EVERY_10_SECONDS) //use this one for debugging
  private async archiveOldDynamicData(): Promise<void> {
    this.logger.log('CronjobService - Started: deleteOldDynamicData');

    await this.adminAreaDynamicDataService.archiveOldDynamicData();

    this.logger.log('CronjobService - Complete: deleteOldDynamicData');
  }
}
