import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShowOnlyTriggeredAreasBoolean1678110416255
  implements MigrationInterface {
  name = 'ShowOnlyTriggeredAreasBoolean1678110416255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "showOnlyTriggeredAreas" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "showOnlyTriggeredAreas"`,
    );
  }
}
