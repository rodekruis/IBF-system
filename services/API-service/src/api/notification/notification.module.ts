import { AdminAreaDynamicDataModule } from './../admin-area-dynamic-data/admin-area-dynamic-data.module';
import { NotificationInfoEntity } from './notifcation-info.entity';
import { EventModule } from './../event/event.module';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { NotificationContentModule } from './notification-content/notification-content.module';
import { EmailService } from './email/email.service';
import { TyphoonTrackModule } from '../typhoon-track/typhoon-track.module';
import { EmailTemplateService } from './email/email-template.service';

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
  providers: [NotificationService, EmailService, EmailTemplateService],
})
export class NotificationModule {}
