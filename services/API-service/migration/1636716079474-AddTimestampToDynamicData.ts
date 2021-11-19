import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampToDynamicData1636716079474
  implements MigrationInterface {
  name = 'AddTimestampToDynamicData1636716079474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD "timestamp" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP COLUMN "timestamp"`,
    );
  }
}
