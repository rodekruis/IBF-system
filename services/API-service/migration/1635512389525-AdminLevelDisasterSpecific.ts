import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminLevelDisasterSpecific1635512389525
  implements MigrationInterface {
  name = 'AdminLevelDisasterSpecific1635512389525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "adminLevels"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "defaultAdminLevel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "disasterTypeSettings" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "disasterTypeSettings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "defaultAdminLevel" json NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "adminLevels" integer array NOT NULL DEFAULT ARRAY[]`,
    );
  }
}
