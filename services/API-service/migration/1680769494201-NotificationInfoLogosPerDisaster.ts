import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationInfoLogosPerDisaster1680769494201
  implements MigrationInterface {
  name = 'NotificationInfoLogosPerDisaster1680769494201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "logo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "logo" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "logo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "logo" character varying NOT NULL`,
    );
  }
}
