import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationLogEntity1783613620760 implements MigrationInterface {
  name = 'NotificationLogEntity1783613620760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "IBF-app"."notification-log_channel_enum" AS ENUM('email', 'whatsapp')`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."notification-log" ("notificationLogId" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel" "IBF-app"."notification-log_channel_enum" NOT NULL, "recipientCount" integer NOT NULL, "countryCodeISO3" character varying NOT NULL, "disasterType" character varying NOT NULL, "eventNames" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e0da1d4036a1085a56d6b2a032" PRIMARY KEY ("notificationLogId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "IBF-app"."notification-log"`);
    await queryRunner.query(
      `DROP TYPE "IBF-app"."notification-log_channel_enum"`,
    );
  }
}
