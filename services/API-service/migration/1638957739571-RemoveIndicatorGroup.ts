import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIndicatorGroup1638957739571 implements MigrationInterface {
  name = 'RemoveIndicatorGroup1638957739571';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "group"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" RENAME COLUMN "active" TO "activeBackup"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "active" character varying`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."indicator-metadata" SET "active" = case when "name" in ('alert_threshold','population_affected','houses_affected') then 'if-trigger' when "activeBackup" = true then 'yes' else 'no' end`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ALTER COLUMN "active" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "activeBackup"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "active" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "group" character varying NOT NULL`,
    );
  }
}
