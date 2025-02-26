import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCovidRiskLayer1740584005389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "IBF-app"."indicator-metadata" WHERE "name" = 'covid_risk'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No down migration needed
  }
}
