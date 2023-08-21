import { MigrationInterface, QueryRunner } from 'typeorm';

export class DecoupleGlofasTriggerLevels1633686048253
  implements MigrationInterface
{
  name = 'DecoupleGlofasTriggerLevels1633686048253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" DROP COLUMN "glofasStation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP COLUMN "triggerLevel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP COLUMN "threshold2Year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP COLUMN "threshold5Year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP COLUMN "threshold10Year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP COLUMN "threshold20Year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "triggerLevel" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "triggerLevel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD "threshold20Year" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD "threshold10Year" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD "threshold5Year" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD "threshold2Year" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD "triggerLevel" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ADD "glofasStation" character varying`,
    );
  }
}
