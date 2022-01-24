import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventStartDate1642779777403 implements MigrationInterface {
  name = 'AddEventStartDate1642779777403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "startDateEvent" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "startDateEvent"`,
    );
  }
}
