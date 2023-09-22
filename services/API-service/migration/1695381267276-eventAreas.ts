import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventAreas1695381267276 implements MigrationInterface {
  name = 'EventAreas1695381267276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "eventAreas" json`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "eventAreas"`,
    );
  }
}
