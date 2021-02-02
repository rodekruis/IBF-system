import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { EapActionEntity } from './eap-action.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionsController } from './eap-actions.controller';
import { EapActionsService } from './eap-actions.service';
import { DataService } from '../data/data.service';
import { AreaOfFocusEntity } from './area-of-focus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EapActionEntity,
      EapActionStatusEntity,
      AreaOfFocusEntity,
    ]),
    UserModule,
    HttpModule,
  ],
  controllers: [EapActionsController],
  providers: [EapActionsService, DataService],
})
export class EapActionsModule {}
