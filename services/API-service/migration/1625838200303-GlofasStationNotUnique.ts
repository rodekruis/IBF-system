import { MigrationInterface, QueryRunner } from 'typeorm';

export class GlofasStationNotUnique1625838200303 implements MigrationInterface {
  name = 'GlofasStationNotUnique1625838200303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP CONSTRAINT "UQ_87a234c5900e80eb2b4de5d4645"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD CONSTRAINT "UQ_87a234c5900e80eb2b4de5d4645" UNIQUE ("stationCode")`,
    );
  }
}
