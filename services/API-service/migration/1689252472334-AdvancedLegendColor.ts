import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvancedLegendColor1689252472334 implements MigrationInterface {
  name = 'AdvancedLegendColor1689252472334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP COLUMN "legendColor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "legendColor" json DEFAULT null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP COLUMN "legendColor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "legendColor" character varying`,
    );
  }
}
