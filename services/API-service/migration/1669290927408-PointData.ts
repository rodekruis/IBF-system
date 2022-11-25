import { MigrationInterface, QueryRunner } from 'typeorm';

export class PointData1669290927408 implements MigrationInterface {
  name = 'PointData1669290927408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."point-data" ("pointDataId" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCodeISO3" character varying NOT NULL, "pointDataCategory" character varying NOT NULL, "attributes" json NOT NULL DEFAULT '{}', "geom" json, CONSTRAINT "PK_7a2ffebe44b27c28c45d1631252" PRIMARY KEY ("pointDataId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "IBF-app"."point-data"`);
  }
}
