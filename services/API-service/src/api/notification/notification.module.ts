import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import { SMTP_CONFIG } from '../../config';
import { HelperService } from '../../shared/helper.service';
import { EmailService } from '../email/email.service';
import { EventModule } from '../event/event.module';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { TyphoonTrackModule } from '../typhoon-track/typhoon-track.module';
import { UserModule } from '../user/user.module';
import { MjmlService } from './email/mjml.service';
import { NotificationInfoEntity } from './notifcation-info.entity';
import { NotificationService } from './notification.service';
import { NotificationContentModule } from './notification-content/notification-content.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationInfoEntity, IndicatorMetadataEntity]),
    UserModule,
    EventModule,
    WhatsappModule,
    NotificationContentModule,
    TyphoonTrackModule,
    MailerModule.forRoot(SMTP_CONFIG),
  ],
  controllers: [],
  providers: [NotificationService, EmailService, MjmlService, HelperService],
  exports: [NotificationService, EmailService],
})
export class NotificationModule {}
