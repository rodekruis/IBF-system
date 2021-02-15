import { Module } from '@nestjs/common';
import { UgaDataLevel2Service } from './uga-data-level-2.service';
import { UgaDataLevel2Controller } from './uga-data-level-2.controller';
import { UserModule } from '../user/user.module';
import { UgaDataLevel2Entity } from './uga-data-level-2.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from '../data/data.module';

@Module({
  imports: [
    DataModule,
    UserModule,
    TypeOrmModule.forFeature([UgaDataLevel2Entity]),
  ],
  providers: [UgaDataLevel2Service],
  controllers: [UgaDataLevel2Controller],
  exports: [UgaDataLevel2Service],
})
export class UgaDataLevel2Module {}
