import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTrigger1741186768255 implements MigrationInterface {
  name = 'UserTrigger1741186768255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "manualStoppedDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "stopped"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "userTriggerDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "userTrigger" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "userTrigger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "userTriggerDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "stopped" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "manualStoppedDate" TIMESTAMP`,
    );
  }
}
