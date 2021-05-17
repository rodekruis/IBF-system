import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AdminAreaDataController } from './admin-area-data.controller';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import { AdminAreaDataService } from './admin-area-data.service';

@Module({
    imports: [
        HttpModule,
        UserModule,
        TypeOrmModule.forFeature([AdminAreaDataEntity]),
    ],
    providers: [AdminAreaDataService],
    controllers: [AdminAreaDataController],
    exports: [AdminAreaDataService],
})
export class AdminAreaDataModule {}
