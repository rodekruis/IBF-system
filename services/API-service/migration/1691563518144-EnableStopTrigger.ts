import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableStopTrigger1691563518144 implements MigrationInterface {
  name = 'EnableStopTrigger1691563518144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "enableEarlyActions" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "enableStopTrigger" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "enableStopTrigger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "enableEarlyActions"`,
    );
  }
}
