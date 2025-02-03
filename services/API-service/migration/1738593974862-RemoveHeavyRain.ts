import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveHeavyRain1738593974862 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "IBF-app"."event-place-code" WHERE "disasterType" = 'heavy-rain'`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."country-disaster-settings" WHERE "disasterType" = 'heavy-rain'`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."admin-area-dynamic-data" WHERE "disasterType" = 'heavy-rain'`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."trigger-per-lead-time" WHERE "disasterType" = 'heavy-rain'`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."user_disaster_types" WHERE "disasterType" = 'heavy-rain'`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."disaster" WHERE "disasterType" = 'heavy-rain'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No down migration
  }
}
