import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCountryCodesISO21736157607558 implements MigrationInterface {
  name = 'RemoveCountryCodesISO21736157607558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP CONSTRAINT "UQ_b2775caab3139a7c73eb9e5f822"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "countryCodeISO2"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "countryCodeISO2" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD CONSTRAINT "UQ_b2775caab3139a7c73eb9e5f822" UNIQUE ("countryCodeISO2")`,
    );
  }
}
