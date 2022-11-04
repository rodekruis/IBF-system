import { MigrationInterface, QueryRunner } from 'typeorm';

export class Whatsapp1667568197151 implements MigrationInterface {
  name = 'Whatsapp1667568197151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."twilio_message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountSid" character varying NOT NULL, "body" character varying NOT NULL, "mediaUrl" character varying, "to" character varying NOT NULL, "from" character varying NOT NULL, "sid" character varying NOT NULL, "status" character varying NOT NULL, "type" character varying NOT NULL, "dateCreated" TIMESTAMP NOT NULL, CONSTRAINT "PK_2e23acd8f40d1b3e564b8ac7c1e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ADD "whatsappNumber" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "useWhatsapp" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "whatsappMessage" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "whatsappMessage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "useWhatsapp"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" DROP COLUMN "whatsappNumber"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."twilio_message"`);
  }
}
