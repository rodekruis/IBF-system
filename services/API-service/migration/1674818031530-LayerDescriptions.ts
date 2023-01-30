import { MigrationInterface, QueryRunner } from 'typeorm';

export class LayerDescriptions1674818031530 implements MigrationInterface {
  name = 'LayerDescriptions1674818031530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "description" json NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "description" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "description"`,
    );
  }
}
