import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserProperties1738064090018 implements MigrationInterface {
  name = 'RemoveUserProperties1738064090018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" DROP CONSTRAINT "UQ_09cdc2f534910e14de7705815a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" DROP COLUMN "username"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" DROP COLUMN "userStatus"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ADD "userStatus" character varying NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ADD CONSTRAINT "UQ_09cdc2f534910e14de7705815a8" UNIQUE ("username")`,
    );
  }
}
