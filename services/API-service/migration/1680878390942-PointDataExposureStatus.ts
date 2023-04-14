import { MigrationInterface, QueryRunner } from 'typeorm';

export class PointDataExposureStatus1680878390942
  implements MigrationInterface {
  name = 'PointDataExposureStatus1680878390942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."point-data-dynamic-status" ("pointDataDynamicStatusId" uuid NOT NULL DEFAULT uuid_generate_v4(), "referenceId" uuid NOT NULL, "timestamp" TIMESTAMP NOT NULL, "exposed" boolean NOT NULL, "leadTime" character varying, CONSTRAINT "PK_e4a407d1bb1af9141b6c659a985" PRIMARY KEY ("pointDataDynamicStatusId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data" ADD "referenceId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" ADD CONSTRAINT "FK_949d762f9a5c67832429fb8c09c" FOREIGN KEY ("referenceId") REFERENCES "IBF-app"."point-data"("pointDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" ADD CONSTRAINT "FK_e4861c75f7e07581bd25ea14560" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" DROP CONSTRAINT "FK_e4861c75f7e07581bd25ea14560"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" DROP CONSTRAINT "FK_949d762f9a5c67832429fb8c09c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data" DROP COLUMN "referenceId"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."point-data-dynamic-status"`);
  }
}
