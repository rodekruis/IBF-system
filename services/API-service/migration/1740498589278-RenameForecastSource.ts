import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameForecastSource1740498589278 implements MigrationInterface {
  name = 'RenameForecastSource1740498589278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" RENAME COLUMN "monthlyForecastInfo" TO "forecastSource"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" RENAME COLUMN "forecastSource" TO "monthlyForecastInfo"`,
    );
  }
}
