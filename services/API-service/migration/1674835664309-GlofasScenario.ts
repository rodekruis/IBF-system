import { MigrationInterface, QueryRunner } from 'typeorm';

export class GlofasScenario1674835664309 implements MigrationInterface {
  name = 'GlofasScenario1674835664309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "forecastProbability"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "forecastTrigger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "eapAlertClass" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "eapAlertClass"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "forecastTrigger" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "forecastProbability" double precision NOT NULL`,
    );
  }
}
