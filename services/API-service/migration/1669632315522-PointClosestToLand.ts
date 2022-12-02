import { MigrationInterface, QueryRunner } from 'typeorm';

export class PointClosestToLand1669632315522 implements MigrationInterface {
  name = 'PointClosestToLand1669632315522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD "closestToLand" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP COLUMN "closestToLand"`,
    );
  }
}
