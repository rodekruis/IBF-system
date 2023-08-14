import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTriggeredBooleanToEvent1654249478272
  implements MigrationInterface
{
  name = 'AddTriggeredBooleanToEvent1654249478272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "thresholdReached" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD "thresholdReached" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP COLUMN "thresholdReached"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "thresholdReached"`,
    );
  }
}
