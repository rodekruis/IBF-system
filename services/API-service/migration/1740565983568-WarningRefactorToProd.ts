import { MigrationInterface, QueryRunner } from 'typeorm';

export class WarningRefactorToProd1740565983568 implements MigrationInterface {
  name = 'WarningRefactorToProd1740565983568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Process uncovered datamodel changes
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_3cae353eb56d44a19f3528a59b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_d7bde05c87df7b533a1c4b783ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_dcdd92b565690f3fa5cb684a050" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_495a2dc210c1d7302e60d800c6d" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Process 'alert_theshold' indicator data change via migration
    await queryRunner.query(
      `UPDATE "IBF-app"."indicator-metadata" SET "label" = 'Area triggered' WHERE "name" = 'alert_threshold';`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."indicator-metadata" SET "name" = 'trigger' WHERE "name" = 'alert_threshold';`,
    );

    // Update 'admin-area-data' table to change 'adminLevel' column type from enum to integer
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" ALTER COLUMN "adminLevel" TYPE integer USING CASE "adminLevel" WHEN '1' THEN 1 WHEN '2' THEN 2 WHEN '3' THEN 3 WHEN '4' THEN 4 END`,
    );
    await queryRunner.query(
      `DROP TYPE "IBF-app"."admin-area-data_adminlevel_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the 'adminLevel' column type from integer back to enum
    await queryRunner.query(
      `CREATE TYPE "IBF-app"."admin-area-data_adminlevel_enum" AS ENUM('1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" ALTER COLUMN "adminLevel" TYPE "IBF-app"."admin-area-data_adminlevel_enum" USING CASE "adminLevel" WHEN 1 THEN '1' WHEN 2 THEN '2' WHEN 3 THEN '3' WHEN 4 THEN '4' END::"IBF-app"."admin-area-data_adminlevel_enum"`,
    );

    // Reverse 'alert_theshold' indicator data change via migration
    await queryRunner.query(
      `UPDATE "IBF-app"."indicator-metadata" SET "label" = 'Alert Threshold Reached' WHERE "name" = 'trigger';`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."indicator-metadata" SET "name" = 'alert_threshold' WHERE "name" = 'trigger';`,
    );

    // Reverse uncovered datamodel changes
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_495a2dc210c1d7302e60d800c6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" DROP CONSTRAINT "FK_dcdd92b565690f3fa5cb684a050"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_d7bde05c87df7b533a1c4b783ac" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" ADD CONSTRAINT "FK_3cae353eb56d44a19f3528a59b2" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
