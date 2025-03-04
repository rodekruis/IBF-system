import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnableSetWarningToTrigger1741089976118
  implements MigrationInterface
{
  name = 'AddEnableSetWarningToTrigger1741089976118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "enableSetWarningToTrigger" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "enableSetWarningToTrigger"`,
    );
  }
}
