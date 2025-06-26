import { Logger } from '@nestjs/common';

import * as fs from 'fs';
import { DataSourceOptions } from 'typeorm';

import { CI, DEV } from './src/config';
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
    DEV || CI
      ? null
      : {
          rejectUnauthorized: false, // https://node-postgres.com/features/ssl#self-signed-cert
          ca: fs.readFileSync('cert/DigiCertGlobalRootCA.crt.pem').toString(),
        },
};
