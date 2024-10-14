import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { API_PATHS } from '../../../config';
import { HelperService } from '../../../shared/helper.service';
import { CountryEntity } from '../../country/country.entity';
import { EventModule } from '../../event/event.module';
import { UserEntity } from '../../user/user.entity';
import { LookupModule } from '../lookup/lookup.module';
import { NotificationContentModule } from '../notification-content/notification-content.module';
import { AuthMiddlewareTwilio } from './auth.middlewareTwilio';
import { TwilioMessageEntity } from './twilio.entity';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TwilioMessageEntity, UserEntity, CountryEntity]),
    LookupModule,
    EventModule,
    NotificationContentModule,
  ],
  providers: [WhatsappService, HelperService],
  controllers: [WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddlewareTwilio).forRoutes(
      {
        path: API_PATHS.whatsAppStatus,
        method: RequestMethod.POST,
      },
      {
        path: API_PATHS.whatsAppIncoming,
        method: RequestMethod.POST,
      },
    );
  }
}
