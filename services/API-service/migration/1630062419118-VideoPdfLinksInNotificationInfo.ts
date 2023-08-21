import { MigrationInterface, QueryRunner } from 'typeorm';

export class VideoPdfLinksInNotificationInfo1630062419118
  implements MigrationInterface
{
  name = 'VideoPdfLinksInNotificationInfo1630062419118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "linkVideo" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "linkPdf" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "linkPdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "linkVideo"`,
    );
  }
}
