import { UserModule } from './../user/user.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
