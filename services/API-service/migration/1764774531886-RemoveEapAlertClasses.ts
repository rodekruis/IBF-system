import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEapAlertClasses1764774531886 implements MigrationInterface {
  name = 'RemoveEapAlertClasses1764774531886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "eapAlertClasses"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "eapAlertClasses" json`,
    );
  }
}
