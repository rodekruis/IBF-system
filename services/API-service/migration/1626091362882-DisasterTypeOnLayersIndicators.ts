import { MigrationInterface, QueryRunner } from 'typeorm';

export class DisasterTypeOnLayersIndicators1626091362882
  implements MigrationInterface
{
  name = 'DisasterTypeOnLayersIndicators1626091362882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."disaster_indicators_indicator-metadata" ("disasterId" uuid NOT NULL, "indicatorMetadataId" uuid NOT NULL, CONSTRAINT "PK_3f732ed078636469e7495d20a44" PRIMARY KEY ("disasterId", "indicatorMetadataId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_70729e95aca2d3b1ce7bcb8f2c" ON "IBF-app"."disaster_indicators_indicator-metadata" ("disasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b063cdef74d4ca04eb08d8d16" ON "IBF-app"."disaster_indicators_indicator-metadata" ("indicatorMetadataId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."disaster_layers_layer-metadata" ("disasterId" uuid NOT NULL, "layerMetadataId" uuid NOT NULL, CONSTRAINT "PK_60adb4e7ba1538333acdb4e8c7d" PRIMARY KEY ("disasterId", "layerMetadataId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_063b7d0811c5c819969992030c" ON "IBF-app"."disaster_layers_layer-metadata" ("disasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef3729bf50d54979ace0097cda" ON "IBF-app"."disaster_layers_layer-metadata" ("layerMetadataId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" DROP COLUMN "disasterType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" DROP COLUMN "disasterType"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."adminLevels" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "adminLevels" SET DEFAULT array[]::int[]`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT array[]::text[]`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_indicators_indicator-metadata" ADD CONSTRAINT "FK_70729e95aca2d3b1ce7bcb8f2ce" FOREIGN KEY ("disasterId") REFERENCES "IBF-app"."disaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_indicators_indicator-metadata" ADD CONSTRAINT "FK_5b063cdef74d4ca04eb08d8d16f" FOREIGN KEY ("indicatorMetadataId") REFERENCES "IBF-app"."indicator-metadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_layers_layer-metadata" ADD CONSTRAINT "FK_063b7d0811c5c819969992030cf" FOREIGN KEY ("disasterId") REFERENCES "IBF-app"."disaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_layers_layer-metadata" ADD CONSTRAINT "FK_ef3729bf50d54979ace0097cda0" FOREIGN KEY ("layerMetadataId") REFERENCES "IBF-app"."layer-metadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_layers_layer-metadata" DROP CONSTRAINT "FK_ef3729bf50d54979ace0097cda0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_layers_layer-metadata" DROP CONSTRAINT "FK_063b7d0811c5c819969992030cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_indicators_indicator-metadata" DROP CONSTRAINT "FK_5b063cdef74d4ca04eb08d8d16f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_indicators_indicator-metadata" DROP CONSTRAINT "FK_70729e95aca2d3b1ce7bcb8f2ce"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "adminLevels" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."country"."adminLevels" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."layer-metadata" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."indicator-metadata" ADD "disasterType" character varying`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_ef3729bf50d54979ace0097cda"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_063b7d0811c5c819969992030c"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."disaster_layers_layer-metadata"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_5b063cdef74d4ca04eb08d8d16"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_70729e95aca2d3b1ce7bcb8f2c"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."disaster_indicators_indicator-metadata"`,
    );
  }
}
