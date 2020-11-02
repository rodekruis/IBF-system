import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { DataModule } from './data/data.module';
import { HealthModule } from './health.module';
import { EapActionsModule } from './eap-actions/eap-actions.module';
import { ScriptsModule } from './scripts/scripts.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    DataModule,
    HealthModule,
    EapActionsModule,
    ScriptsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  public constructor(private readonly connection: Connection) {}
}
