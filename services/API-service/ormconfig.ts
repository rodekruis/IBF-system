import * as fs from 'fs';
import { DataSourceOptions } from 'typeorm';

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
  logger: 'advanced-console',
  maxQueryExecutionTime: 1000,
  migrations: ['migration/*.ts'],
  ssl:
    process.env.NODE_ENV === 'development'
      ? null
      : {
          ca: fs.readFileSync('cert/DigiCertGlobalRootCA.crt.pem').toString(),
        },
};
