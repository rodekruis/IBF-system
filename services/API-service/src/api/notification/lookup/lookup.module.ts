import { Module } from '@nestjs/common';

import { LookupService } from './lookup.service';

@Module({
  imports: [],
  providers: [LookupService],
  controllers: [],
  exports: [LookupService],
})
export class LookupModule {}
