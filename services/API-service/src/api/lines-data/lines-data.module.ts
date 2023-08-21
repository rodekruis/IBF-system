import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperService } from '../../shared/helper.service';
import { UserModule } from '../user/user.module';
import { LinesDataController } from './lines-data.controller';
import { LinesDataEntity } from './lines-data.entity';
import { LinesDataService } from './lines-data.service';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([LinesDataEntity, LinesDataDynamicStatusEntity]),
  ],
  providers: [LinesDataService, HelperService],
  controllers: [LinesDataController],
  exports: [LinesDataService],
})
export class LinesDataModule {}
