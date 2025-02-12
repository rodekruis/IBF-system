import { MigrationInterface, QueryRunner } from 'typeorm';

export class WarningDatamodelChanges1739354035846
  implements MigrationInterface
{
  name = 'WarningDatamodelChanges1739354035846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // trigger-per-lead-time
    // rename the table
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" RENAME TO "alert-per-lead-time"`,
    );
    // rename the columns
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" RENAME COLUMN "thresholdReached" TO "forecastTrigger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" RENAME COLUMN "triggered" TO "forecastAlert"`,
    );

    // event-place-code
    // rename the columns
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "thresholdReached" TO "forecastTrigger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "triggerValue" TO "forecastSeverity"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "forecastTrigger" TO "thresholdReached"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "forecastSeverity" TO "triggerValue"`,
    );

    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" RENAME COLUMN "forecastTrigger" TO "thresholdReached"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" RENAME COLUMN "forecastAlert" TO "triggered"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."alert-per-lead-time" RENAME TO "trigger-per-lead-time"`,
    );
  }
}
