import { DataModule } from './../data/data.module';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { HealthSiteController } from './health-site.controller';
import { HealthSiteEntity } from './health-site.entity';
import { HealthSiteService } from './health-site.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    DataModule,
    TypeOrmModule.forFeature([HealthSiteEntity]),
  ],
  providers: [HealthSiteService],
  controllers: [HealthSiteController],
  exports: [HealthSiteService],
})
export class HealthSiteModule {}
