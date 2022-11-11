import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstLandfallTrack1668180759764 implements MigrationInterface {
  name = 'AddFirstLandfallTrack1668180759764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD "firstLandfall" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP COLUMN "firstLandfall"`,
    );
  }
}
