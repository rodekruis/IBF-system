import * as fs from 'fs';

module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'IBF-app',
  entities: ['src/**/**.entity{.ts,.js}'],
  dropSchema: false,
  synchronize: false,
  logging: ['error'],
  logger: 'advanced-console',
  maxQueryExecutionTime: 1000,
  migrations: ['migration/*.ts'],
  cli: {
    migrationsDir: 'migration',
  },
  ssl:
    process.env.NODE_ENV === 'development'
      ? null
      : {
          ca: fs.readFileSync('cert/DigiCertGlobalRootCA.crt.pem').toString(),
        },
};
