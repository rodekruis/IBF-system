import { Module } from '@nestjs/common';
import { CountryModule } from '../country/country.module';
import { UserModule } from '../user/user.module';
import { WaterpointsController } from './waterpoints.controller';
import { WaterpointsService } from './waterpoints.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, UserModule, CountryModule],
  providers: [WaterpointsService],
  controllers: [WaterpointsController],
  exports: [WaterpointsService],
})
export class WaterpointsModule {}
