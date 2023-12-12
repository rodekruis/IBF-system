import { MigrationInterface, QueryRunner } from 'typeorm';

export class PointReferenceIdString1700396447482 implements MigrationInterface {
  name = 'PointReferenceIdString1700396447482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data" RENAME COLUMN "referenceId" TO "referenceIdOld"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data" ADD "referenceId" character varying`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."point-data" SET "referenceId" = "referenceIdOld"::varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data" DROP COLUMN "referenceIdOld"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data" DROP COLUMN "referenceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data" ADD "referenceId" integer`,
    );
  }
}
