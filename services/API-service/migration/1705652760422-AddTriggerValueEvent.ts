import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTriggerValueEvent1705652760422 implements MigrationInterface {
  name = 'AddTriggerValueEvent1705652760422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "triggerValue" double precision`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."event-place-code" SET "triggerValue" = 1 WHERE "thresholdReached" = true`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."event-place-code" SET "triggerValue" = 0 WHERE "thresholdReached" = false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "triggerValue"`,
    );
  }
}
