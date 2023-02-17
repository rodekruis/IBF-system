import { MigrationInterface, QueryRunner } from 'typeorm';

export class MailSegments1676317537118 implements MigrationInterface {
  name = 'MailSegments1676317537118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "mailSegment" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "mailSegment"`,
    );
  }
}
