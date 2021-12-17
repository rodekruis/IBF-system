import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeightVar1639732066552 implements MigrationInterface {
  name = 'AddWeightVar1639732066552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "weightVar" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "weightVar"`,
    );
  }
}
