import {MigrationInterface, QueryRunner} from "typeorm";

export class SingularAdminRegionLabels1623080335459 implements MigrationInterface {
    name = 'SingularAdminRegionLabels1623080335459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" DROP COLUMN "adminRegionLabels"`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ADD "adminRegionLabels" json NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT array[]::text[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" DROP COLUMN "adminRegionLabels"`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ADD "adminRegionLabels" text array NOT NULL DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`);
    }

}
