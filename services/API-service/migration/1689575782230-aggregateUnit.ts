import { MigrationInterface, QueryRunner } from 'typeorm';

export class aggregateUnit1689575782230 implements MigrationInterface {
  name = 'aggregateUnit1689575782230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "aggregateUnit" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "aggregateUnit"`,
    );
  }
}
