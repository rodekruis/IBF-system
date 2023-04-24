import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinesDataGeom1682071888678 implements MigrationInterface {
  name = 'LinesDataGeom1682071888678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."lines-data" ("linesDataId" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCodeISO3" character varying NOT NULL, "linesDataCategory" character varying NOT NULL, "referenceId" integer, "attributes" json NOT NULL DEFAULT '{}', "geom" geometry, CONSTRAINT "PK_b001b6db8db313fa0299da7d212" PRIMARY KEY ("linesDataId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."lines-data-dynamic-status" ("linesDataDynamicStatusId" uuid NOT NULL DEFAULT uuid_generate_v4(), "referenceId" uuid NOT NULL, "timestamp" TIMESTAMP NOT NULL, "exposed" boolean NOT NULL, "leadTime" character varying, CONSTRAINT "PK_1273835fad6885829248279bf13" PRIMARY KEY ("linesDataDynamicStatusId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" ADD CONSTRAINT "FK_72b1a0d51cd5213f1700263443e" FOREIGN KEY ("referenceId") REFERENCES "IBF-app"."lines-data"("linesDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" ADD CONSTRAINT "FK_7809876cae5bd4cae47851c2105" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f61bb4749d5419c6613e52ada4" ON "IBF-app"."lines-data" USING GiST ("geom") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_f61bb4749d5419c6613e52ada4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" DROP CONSTRAINT "FK_7809876cae5bd4cae47851c2105"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" DROP CONSTRAINT "FK_72b1a0d51cd5213f1700263443e"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."lines-data-dynamic-status"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."lines-data"`);
  }
}
