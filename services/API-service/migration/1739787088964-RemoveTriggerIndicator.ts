import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTriggerIndicator1739787088964 implements MigrationInterface {
  name = 'RemoveTriggerIndicator1739787088964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "triggerIndicator"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "triggerIndicator" character varying NOT NULL DEFAULT 'alert_threshold'`,
    );
  }
}
