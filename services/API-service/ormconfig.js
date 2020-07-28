module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'IBF-pipeline-output',
  entities: ['src/**/**.entity{.ts,.js}'],
  dropSchema: false,
  synchronize: false,
  logging: ['query'],
  logger: 'file',
};
