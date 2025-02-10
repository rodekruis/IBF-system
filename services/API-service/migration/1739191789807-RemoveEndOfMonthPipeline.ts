import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEndOfMonthPipeline1739191789807
  implements MigrationInterface
{
  name = 'RemoveEndOfMonthPipeline1739191789807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "droughtEndOfMonthPipeline"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "droughtEndOfMonthPipeline" boolean NOT NULL DEFAULT false`,
    );
  }
}
