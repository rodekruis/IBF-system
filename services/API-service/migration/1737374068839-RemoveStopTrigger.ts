import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveStopTrigger1737374068839 implements MigrationInterface {
  name = 'RemoveStopTrigger1737374068839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "enableStopTrigger"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "enableStopTrigger" boolean NOT NULL DEFAULT true`,
    );
  }
}
