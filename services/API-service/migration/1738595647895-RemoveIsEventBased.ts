import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIsEventBased1738595647895 implements MigrationInterface {
  name = 'RemoveIsEventBased1738595647895';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "isEventBased"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "isEventBased" boolean NOT NULL DEFAULT false`,
    );
  }
}
