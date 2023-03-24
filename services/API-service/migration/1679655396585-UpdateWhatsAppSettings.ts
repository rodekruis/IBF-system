import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWhatsAppSettings1679655396585 implements MigrationInterface {
  name = 'UpdateWhatsAppSettings1679655396585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "useWhatsapp"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "useWhatsapp" json DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "useWhatsapp"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "useWhatsapp" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`,
    );
  }
}
