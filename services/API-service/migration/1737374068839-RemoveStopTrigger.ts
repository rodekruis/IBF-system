import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveStopTrigger1737374068839 implements MigrationInterface {
  name = 'RemoveStopTrigger1737374068839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "enableStopTrigger"`,
    );

    // Empty stop-trigger columns, as we are removing the functionality, just keeping the columns to repurpose them later
    await queryRunner.query(
      `UPDATE "IBF-app"."event-place-code" SET "stopped" = false`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."event-place-code" SET "manualStoppedDate" = null`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."event-place-code" SET "userUserId" = null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "enableStopTrigger" boolean NOT NULL DEFAULT true`,
    );
  }
}
