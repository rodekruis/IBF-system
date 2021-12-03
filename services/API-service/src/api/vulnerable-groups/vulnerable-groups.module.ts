import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { VulnerableGroupsController } from './vulnerable-groups.controller';
import { VulnerableGroupsEntity } from './vulnerable-groups.entity';
import { VulnerableGroupsService } from './vulnerable-groups.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    EventModule,
    TypeOrmModule.forFeature([VulnerableGroupsEntity]),
  ],
  providers: [VulnerableGroupsService, HelperService],
  controllers: [VulnerableGroupsController],
  exports: [VulnerableGroupsService],
})
export class VulnerableGroupsModule {}
