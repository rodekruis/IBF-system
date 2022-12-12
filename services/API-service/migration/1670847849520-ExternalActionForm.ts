import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExternalActionForm1670847849520 implements MigrationInterface {
  name = 'ExternalActionForm1670847849520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "externalEarlyActionForm" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "externalEarlyActionForm"`,
    );
  }
}
