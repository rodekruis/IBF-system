import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { EventModule } from '../event/event.module';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { TyphoonTrackModule } from '../typhoon-track/typhoon-track.module';
import { UserModule } from '../user/user.module';
import { EmailService } from './email/email.service';
import { MjmlService } from './email/mjml.service';
import { NotificationInfoEntity } from './notifcation-info.entity';
import { NotificationContentModule } from './notification-content/notification-content.module';
import { NotificationService } from './notification.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationInfoEntity, IndicatorMetadataEntity]),
    UserModule,
    EventModule,
    WhatsappModule,
    NotificationContentModule,
    TyphoonTrackModule,
  ],
  controllers: [],
  providers: [NotificationService, EmailService, MjmlService, HelperService],
  exports: [NotificationService],
})
export class NotificationModule {}
