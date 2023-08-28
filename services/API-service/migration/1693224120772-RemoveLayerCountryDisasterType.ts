import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLayerCountryDisasterType1693224120772
  implements MigrationInterface
{
  name = 'RemoveLayerCountryDisasterType1693224120772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "countryCodes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP COLUMN "countryCodes"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "countryCodes" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "countryCodes" character varying NOT NULL`,
    );
  }
}
