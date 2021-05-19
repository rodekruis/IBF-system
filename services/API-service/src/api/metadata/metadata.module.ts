import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from '../data/data.module';
import { UserModule } from '../user/user.module';
import { MetadataController } from './metadata.controller';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { MetadataService } from './metadata.service';
import { LayerMetadataEntity } from './layer-metadata.entity';

@Module({
    imports: [
        HttpModule,
        UserModule,
        TypeOrmModule.forFeature([
            IndicatorMetadataEntity,
            LayerMetadataEntity,
        ]),
        DataModule,
    ],
    providers: [MetadataService],
    controllers: [MetadataController],
    exports: [MetadataService],
})
export class MetadataModule {}
