import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameOperator1742308908301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "IBF-app"."user" SET "userRole" = 'operator' WHERE "userRole" = 'disaster-manager'`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."user" SET "userRole" = 'viewer' WHERE "userRole" = 'guest'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "IBF-app"."user" SET "userRole" = 'disaster-manager' WHERE "userRole" = 'operator'`,
    );
    await queryRunner.query(
      `UPDATE "IBF-app"."user" SET "userRole" = 'guest' WHERE "userRole" = 'viewer'`,
    );
  }
}
