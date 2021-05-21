import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { HealthSiteController } from './health-site.controller';
import { HealthSiteEntity } from './health-site.entity';
import { HealthSiteService } from './health-site.service';
import { HelperService } from '../../shared/helper.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([HealthSiteEntity]),
  ],
  providers: [HealthSiteService, HelperService],
  controllers: [HealthSiteController],
  exports: [HealthSiteService],
})
export class HealthSiteModule {}
