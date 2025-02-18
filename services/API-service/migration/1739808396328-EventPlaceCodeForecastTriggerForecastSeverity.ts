import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventPlaceCodeForecastTriggerForecastSeverity1739808396328
  implements MigrationInterface
{
  name = 'EventPlaceCodeForecastTriggerForecastSeverity1739808396328';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
