import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDroughtAreasToCountryDisasterSettings1653892419259
  implements MigrationInterface
{
  name = 'AddDroughtAreasToCountryDisasterSettings1653892419259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "droughtAreas" json`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "droughtAreas"`,
    );
  }
}
