import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserUserRoleDefaultViewer1745933863691
  implements MigrationInterface
{
  name = 'UserUserRoleDefaultViewer1745933863691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ALTER COLUMN "userRole" SET DEFAULT 'viewer'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ALTER COLUMN "userRole" SET DEFAULT 'guest'`,
    );
  }
}
