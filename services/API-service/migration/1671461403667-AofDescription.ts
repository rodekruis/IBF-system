import { MigrationInterface, QueryRunner } from 'typeorm';

export class AofDescription1671461403667 implements MigrationInterface {
  name = 'AofDescription1671461403667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."area-of-focus" ADD "description" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."area-of-focus" DROP COLUMN "description"`,
    );
  }
}
