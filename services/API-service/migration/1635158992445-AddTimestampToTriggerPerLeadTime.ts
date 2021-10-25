import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampToTriggerPerLeadTime1635158992445
  implements MigrationInterface {
  name = 'AddTimestampToTriggerPerLeadTime1635158992445';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD "timestamp" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP COLUMN "timestamp"`,
    );
  }
}
