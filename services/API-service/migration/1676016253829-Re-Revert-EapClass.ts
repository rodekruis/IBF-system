import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReRevertEapClass1676016253829 implements MigrationInterface {
  name = 'ReRevertEapClass1676016253829';

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
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "forecastTrigger" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "forecastProbability" double precision`,
    );
  }
}
