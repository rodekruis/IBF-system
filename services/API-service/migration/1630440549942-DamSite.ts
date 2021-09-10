import { MigrationInterface, QueryRunner } from 'typeorm';

export class DamSite1630440549942 implements MigrationInterface {
  name = 'DamSite1630440549942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."dam-site" ("damSiteId" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCodeISO3" character varying NOT NULL, "damName" character varying NOT NULL, "fullSupply" real NOT NULL, "geom" json, CONSTRAINT "PK_7b4c57c149d7dcf045697fc1aed" PRIMARY KEY ("damSiteId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "IBF-app"."dam-site"`);
  }
}
