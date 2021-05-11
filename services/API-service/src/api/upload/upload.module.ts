import { UserModule } from './../user/user.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculatedAffectedEntity } from './calculated-affected.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TriggerPerLeadTime,
            CalculatedAffectedEntity,
        ]),
        UserModule,
    ],
    controllers: [UploadController],
    providers: [UploadService],
})
export class UploadModule {}
