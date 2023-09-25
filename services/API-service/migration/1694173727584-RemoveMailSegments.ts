import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMailSegments1694173727584 implements MigrationInterface {
  name = 'RemoveMailSegments1694173727584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" DROP COLUMN "mailSegment"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."notification_info" ADD "mailSegment" json NOT NULL DEFAULT '{}'`,
    );
  }
}
