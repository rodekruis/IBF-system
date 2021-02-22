import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from '../data/data.module';
import { UserModule } from '../user/user.module';
import { AdminAreaController } from './admin-area.controller';
import { AdminAreaEntity } from './admin-area.entity';
import { AdminAreaService } from './admin-area.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([AdminAreaEntity]),
  ],
  providers: [AdminAreaService],
  controllers: [AdminAreaController],
  exports: [AdminAreaService],
})
export class AdminAreaModule {}
