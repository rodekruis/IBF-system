import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventStartDate1742830618355 implements MigrationInterface {
  name = 'AddEventStartDate1742830618355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "eventStartDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "eventTriggerStartDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "pipelineUpdateTimestamp" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ALTER COLUMN "userRole" SET DEFAULT 'viewer'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ALTER COLUMN "userRole" SET DEFAULT 'guest'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "pipelineUpdateTimestamp"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "eventTriggerStartDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "eventStartDate"`,
    );
  }
}
