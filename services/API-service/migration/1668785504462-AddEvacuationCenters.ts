import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEvacuationCenters1668785504462 implements MigrationInterface {
  name = 'AddEvacuationCenters1668785504462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."evacuation-center" ("evacuationCenterId" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCodeISO3" character varying NOT NULL, "evacuationCenterName" character varying NOT NULL, "geom" json, CONSTRAINT "PK_49898799300edfa57c79b159c78" PRIMARY KEY ("evacuationCenterId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "IBF-app"."evacuation-center"`);
  }
}
