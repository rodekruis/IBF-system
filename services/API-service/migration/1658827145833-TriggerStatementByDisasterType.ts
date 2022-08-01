import { MigrationInterface, QueryRunner } from 'typeorm';

export class TriggerStatementByDisasterType1658827145833
  implements MigrationInterface {
  name = 'TriggerStatementByDisasterType1658827145833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "triggerStatement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "triggerStatement" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "triggerStatement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "triggerStatement" character varying NOT NULL`,
    );
  }
}
