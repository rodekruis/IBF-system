import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { EventModule } from '../event/event.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { ProcessPipelineController } from './process-pipeline.controller';
import { ProcessPipelineService } from './process-pipeline.service';

@Module({
  imports: [
    UserModule,
    EventModule,
    NotificationModule,
    TypeOrmModule.forFeature([]),
  ],
  controllers: [ProcessPipelineController],
  providers: [ProcessPipelineService, HelperService],
  exports: [ProcessPipelineService],
})
export class ProcessPipelineModule {}
