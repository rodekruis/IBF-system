import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEapActionMonth1653053233832 implements MigrationInterface {
  name = 'UpdateEapActionMonth1653053233832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP COLUMN "month"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD "month" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP COLUMN "month"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD "month" integer`,
    );
  }
}
