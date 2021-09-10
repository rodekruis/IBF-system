import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { DamSiteController } from './dam-site.controller';
import { DamSiteEntity } from './dam-site.entity';
import { DamSiteService } from './dam-site.service';
import { HelperService } from '../../shared/helper.service';

@Module({
  imports: [HttpModule, UserModule, TypeOrmModule.forFeature([DamSiteEntity])],
  providers: [DamSiteService, HelperService],
  controllers: [DamSiteController],
  exports: [DamSiteService],
})
export class DamSiteModule {}
