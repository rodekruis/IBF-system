import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDroughtForecastMonths1658835952815
  implements MigrationInterface {
  name = 'RenameDroughtForecastMonths1658835952815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "droughtForecastMonths"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "droughtForecastSeasons" json`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "droughtForecastSeasons"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "droughtForecastMonths" json`,
    );
  }
}
