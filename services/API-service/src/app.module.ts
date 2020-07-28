import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { DataModule } from './data/data.module';
import { HealthModule } from './health.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'www'),
    }),
    TypeOrmModule.forRoot(),
    UserModule,
    DataModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  public constructor(private readonly connection: Connection) {}
}
