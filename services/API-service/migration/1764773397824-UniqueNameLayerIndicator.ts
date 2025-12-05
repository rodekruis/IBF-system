import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueNameLayerIndicator1764773397824
  implements MigrationInterface
{
  name = 'UniqueNameLayerIndicator1764773397824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD CONSTRAINT "UQ_f5d0a285b06902b0a85b27c1aeb" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD CONSTRAINT "UQ_aa2581a770350c0f04f161eb581" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP CONSTRAINT "UQ_aa2581a770350c0f04f161eb581"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP CONSTRAINT "UQ_f5d0a285b06902b0a85b27c1aeb"`,
    );
  }
}
