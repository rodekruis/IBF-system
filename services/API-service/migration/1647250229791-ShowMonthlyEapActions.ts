import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShowMonthlyEapActions1647250229791 implements MigrationInterface {
  name = 'ShowMonthlyEapActions1647250229791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "showMonthlyEapActions" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "monthlyForecastInfo" json DEFAULT null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "monthlyForecastInfo"`,
    );

    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "showMonthlyEapActions"`,
    );
  }
}
