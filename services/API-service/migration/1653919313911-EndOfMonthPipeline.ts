import { MigrationInterface, QueryRunner } from 'typeorm';

export class EndOfMonthPipeline1653919313911 implements MigrationInterface {
  name = 'EndOfMonthPipeline1653919313911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "droughtEndOfMonthPipeline" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "droughtEndOfMonthPipeline"`,
    );
  }
}
