import { Module, HttpModule } from '@nestjs/common';
import { WaterpointsController } from './waterpoints.controller';
import { WaterpointsService } from './waterpoints.service';

@Module({
  imports: [HttpModule],
  providers: [WaterpointsService],
  controllers: [WaterpointsController],
  exports: [WaterpointsService],
})
export class WaterpointsModule {}
