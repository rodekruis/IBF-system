import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { TyphoonTrackModule } from '../typhoon-track/typhoon-track.module';
import { UserModule } from '../user/user.module';
import { AdminAreaDynamicDataModule } from './../admin-area-dynamic-data/admin-area-dynamic-data.module';
import { EventModule } from './../event/event.module';
import { EmailTemplateService } from './email/email-template.service';
import { EmailService } from './email/email.service';
import { NotificationInfoEntity } from './notifcation-info.entity';
import { NotificationContentModule } from './notification-content/notification-content.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationInfoEntity, IndicatorMetadataEntity]),
    UserModule,
    EventModule,
    AdminAreaDynamicDataModule,
    WhatsappModule,
    NotificationContentModule,
    TyphoonTrackModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailService,
    EmailTemplateService,
    HelperService,
  ],
})
export class NotificationModule {}
