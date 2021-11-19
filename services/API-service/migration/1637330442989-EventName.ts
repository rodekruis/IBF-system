import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventName1637330442989 implements MigrationInterface {
  name = 'EventName1637330442989';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "eventName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "eventName"`,
    );
  }
}
