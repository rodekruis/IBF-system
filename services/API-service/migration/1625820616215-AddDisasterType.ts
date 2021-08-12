import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDisasterType1625820616215 implements MigrationInterface {
  name = 'AddDisasterType1625820616215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."disaster"."disasterType" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ADD CONSTRAINT "UQ_a5bed74e4adfa39c1f31bb9e880" UNIQUE ("disasterType")`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_1b74fc5a35619f3551ea3faac7c" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_61c802704b8e1e762e8756bc18e" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_865ce419c854bdee5c1b32efe8d" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD CONSTRAINT "FK_a8f44aa44cadc9bb115221f4610" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP CONSTRAINT "FK_a8f44aa44cadc9bb115221f4610"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_865ce419c854bdee5c1b32efe8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_61c802704b8e1e762e8756bc18e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_1b74fc5a35619f3551ea3faac7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" DROP CONSTRAINT "UQ_a5bed74e4adfa39c1f31bb9e880"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."disaster"."disasterType" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP COLUMN "disasterType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "disasterType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP COLUMN "disasterType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP COLUMN "disasterType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP COLUMN "disasterType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "disasterType"`,
    );
  }
}
