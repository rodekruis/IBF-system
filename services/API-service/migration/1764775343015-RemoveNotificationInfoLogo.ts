import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNotificationInfoLogo1764775343015
  implements MigrationInterface
{
  name = 'RemoveNotificationInfoLogo1764775343015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "logo"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "logo" json NOT NULL DEFAULT '{}'`,
    );
  }
}
