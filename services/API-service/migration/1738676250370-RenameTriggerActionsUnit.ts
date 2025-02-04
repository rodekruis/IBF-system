import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTriggerActionsUnit1738676250370
  implements MigrationInterface
{
  name = 'RenameTriggerActionsUnit1738676250370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "actionsValue" TO "mainExposureValue"`,
    );

    // Create new columns
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "triggerIndicator" character varying NOT NULL DEFAULT 'alert_threshold'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "mainExposureIndicator" character varying NOT NULL DEFAULT 'population_affected'`,
    );

    // Copy data from old to new column
    await queryRunner.query(
      `UPDATE "IBF-app"."disaster" SET "triggerIndicator" = "triggerUnit"`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."disaster" SET "mainExposureIndicator" = "actionsUnit"`,
    );

    // Drop old column
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "triggerUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "actionsUnit"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "mainExposureIndicator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "triggerIndicator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "actionsUnit" character varying NOT NULL DEFAULT 'population_affected'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "triggerUnit" character varying NOT NULL DEFAULT 'population_affected'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "mainExposureValue" TO "actionsValue"`,
    );
  }
}
