import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveActiveTrigger1710755059526 implements MigrationInterface {
  name = 'RemoveActiveTrigger1710755059526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "activeTrigger"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "activeTrigger" boolean NOT NULL DEFAULT true`,
    );
  }
}
