import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoreTrackpointAttributes1665129567138
  implements MigrationInterface
{
  name = 'MoreTrackpointAttributes1665129567138';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD "windspeed" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD "category" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP COLUMN "category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP COLUMN "windspeed"`,
    );
  }
}
