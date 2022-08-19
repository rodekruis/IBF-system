import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamecountryCodes1660560935256 implements MigrationInterface {
  name = 'RenamecountryCodes1660560935256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" RENAME COLUMN "country_codes" TO "countryCodes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" RENAME COLUMN "country_codes" TO "countryCodes"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" RENAME COLUMN "countryCodes" TO "country_codes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" RENAME COLUMN "countryCodes" TO "country_codes"`,
    );
  }
}
