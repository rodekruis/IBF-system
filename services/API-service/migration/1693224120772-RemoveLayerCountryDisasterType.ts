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
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "aggregateIndicator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "countryDisasterTypes" json NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "countryDisasterTypes" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "countryDisasterTypes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP COLUMN "countryDisasterTypes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "aggregateIndicator" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "countryCodes" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "countryCodes" character varying`,
    );
  }
}
