import * as fs from 'fs';
import { Logger } from '@nestjs/common';

import { DataSourceOptions } from 'typeorm';

import { TypeOrmLoggerContainer } from './src/typeorm.logger';

export const ORMConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'IBF-app',
  entities: ['src/**/**.entity.ts'],
  dropSchema: false,
  synchronize: false,
  logging: ['error'],
  logger: new TypeOrmLoggerContainer(new Logger('TypeORM'), ['error', 'log']),
  maxQueryExecutionTime: 1000,
  migrations: ['migration/*.ts'],
  ssl:
    ['development', 'ci'].indexOf(process.env.NODE_ENV) >= 0
      ? null
      : { ca: fs.readFileSync('cert/DigiCertGlobalRootCA.crt.pem').toString() },
};
