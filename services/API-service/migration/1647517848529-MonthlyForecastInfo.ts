import { MigrationInterface, QueryRunner } from 'typeorm';

export class MonthlyForecastInfo1647517848529 implements MigrationInterface {
  name = 'MonthlyForecastInfo1647517848529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "monthlyForecastInfo" json DEFAULT null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "monthlyForecastInfo"`,
    );
  }
}
