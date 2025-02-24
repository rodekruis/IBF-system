import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexTimestampDynamicData1739866139545
  implements MigrationInterface
{
  name = 'IndexTimestampDynamicData1739866139545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_f37606a5cd3700f6356292af82" ON "IBF-app"."admin-area-dynamic-data" ("timestamp") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_f37606a5cd3700f6356292af82"`,
    );
  }
}
