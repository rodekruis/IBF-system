import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arguments } from 'yargs';
import { ScriptsController } from './scripts.controller';
import { SeedInit } from './seed-init';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      migrations: [`src/migrations/*.{ts,js}`],
      entities: ['src/app/**/*.entity.{ts,js}'],
    }),
  ],
  providers: [SeedInit],
  controllers: [ScriptsController],
})
export class ScriptsModule {}

export interface InterfaceScript {
  run?(argv: Arguments): Promise<void>;
  runArray?(argv: Arguments): Promise<void[]>;
}
