import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventNameEverywhere1637936584460 implements MigrationInterface {
  name = 'AddEventNameEverywhere1637936584460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD "eventName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD "eventName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD "eventName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP COLUMN "eventName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP COLUMN "eventName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP COLUMN "eventName"`,
    );
  }
}
