import { MigrationInterface, QueryRunner } from 'typeorm';

export class RmUnusedCountryColumns1660554646487 implements MigrationInterface {
  name = 'RmUnusedCountryColumns1660554646487';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "countryStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "glofasStationInput"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "glofasStationInput" json`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "countryStatus" character varying NOT NULL DEFAULT 'active'`,
    );
  }
}
