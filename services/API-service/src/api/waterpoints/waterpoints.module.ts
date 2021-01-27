import { Module, HttpModule } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { WaterpointsController } from './waterpoints.controller';
import { WaterpointsService } from './waterpoints.service';

@Module({
  imports: [HttpModule, UserModule],
  providers: [WaterpointsService],
  controllers: [WaterpointsController],
  exports: [WaterpointsService],
})
export class WaterpointsModule {}
