import { MigrationInterface, QueryRunner } from 'typeorm';

export class DisasterLeadTimes1687170347754 implements MigrationInterface {
  name = 'DisasterLeadTimes1687170347754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "leadTimeUnit" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "minLeadTime" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD "maxLeadTime" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "maxLeadTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "minLeadTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP COLUMN "leadTimeUnit"`,
    );
  }
}
