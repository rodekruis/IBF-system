import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEapActionMonth1646646562014 implements MigrationInterface {
  name = 'AddEapActionMonth1646646562014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD "month" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP COLUMN "month"`,
    );
  }
}
