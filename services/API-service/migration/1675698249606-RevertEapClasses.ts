import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevertEapClasses1675698249606 implements MigrationInterface {
  name = 'RevertEapClasses1675698249606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "eapAlertClass"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "forecastProbability" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "forecastTrigger" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "forecastTrigger"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "forecastProbability"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "eapAlertClass" character varying`,
    );
  }
}
