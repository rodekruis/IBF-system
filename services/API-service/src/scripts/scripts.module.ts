import { AdminAreaDynamicDataModule } from './../api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arguments } from 'yargs';
import { ScriptsController } from './scripts.controller';
import { SeedInit } from './seed-init';
import { GlofasStationModule } from '../api/glofas-station/glofas-station.module';
import { ScriptsService } from './scripts.service';
import { EventModule } from '../api/event/event.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            migrations: [`src/migrations/*.{ts,js}`],
            entities: ['src/app/**/*.entity.{ts,js}'],
        }),
        AdminAreaDynamicDataModule,
        GlofasStationModule,
        EventModule,
    ],
    providers: [SeedInit, ScriptsService],
    controllers: [ScriptsController],
})
export class ScriptsModule {}

export interface InterfaceScript {
    run(argv: Arguments): Promise<void>;
}
