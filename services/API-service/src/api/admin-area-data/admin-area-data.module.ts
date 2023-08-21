import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { UserModule } from '../user/user.module';
import { AdminAreaDataController } from './admin-area-data.controller';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import { AdminAreaDataService } from './admin-area-data.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([AdminAreaDataEntity]),
  ],
  providers: [AdminAreaDataService, HelperService],
  controllers: [AdminAreaDataController],
  exports: [AdminAreaDataService],
})
export class AdminAreaDataModule {}
