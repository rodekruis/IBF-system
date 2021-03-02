import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { GlofasStationController } from './glofas-station.controller';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([GlofasStationEntity]),
  ],
  providers: [GlofasStationService],
  controllers: [GlofasStationController],
  exports: [GlofasStationService],
})
export class GlofasStationModule {}
