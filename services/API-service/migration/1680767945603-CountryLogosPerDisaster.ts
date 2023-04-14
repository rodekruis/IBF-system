import { MigrationInterface, QueryRunner } from 'typeorm';

export class CountryLogosPerDisaster1680767945603
  implements MigrationInterface {
  name = 'CountryLogosPerDisaster1680767945603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "countryLogos"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "countryLogos" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "countryLogos"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "countryLogos" text array NOT NULL DEFAULT ARRAY[]`,
    );
  }
}
