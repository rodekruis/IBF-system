import { MigrationInterface, QueryRunner } from 'typeorm';

export class SingularAdminRegionLabels1623080335459
  implements MigrationInterface {
  public name = 'SingularAdminRegionLabels1623080335459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "adminRegionLabels"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "adminRegionLabels" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "adminRegionLabels"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "adminRegionLabels" text array NOT NULL DEFAULT ARRAY[]`,
    );
  }
}
