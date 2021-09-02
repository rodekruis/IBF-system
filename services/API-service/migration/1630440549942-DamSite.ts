import {MigrationInterface, QueryRunner} from "typeorm";

export class DamSite1630440549942 implements MigrationInterface {
    name = 'DamSite1630440549942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "IBF-app"."dam-site" ("damSiteId" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCodeISO3" character varying NOT NULL, "damName" character varying NOT NULL, "fullSupply" character varying NOT NULL, "currentCapacity" character varying NOT NULL, "percentageFull" character varying NOT NULL, "geom" json, CONSTRAINT "PK_7b4c57c149d7dcf045697fc1aed" PRIMARY KEY ("damSiteId"))`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."adminLevels" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "adminLevels" SET DEFAULT array[]::int[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT array[]::text[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."redcross-branch" DROP COLUMN "numberOfVolunteers"`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."redcross-branch" ADD "numberOfVolunteers" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "IBF-app"."redcross-branch" DROP COLUMN "numberOfVolunteers"`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."redcross-branch" ADD "numberOfVolunteers" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "adminLevels" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."adminLevels" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`);
        await queryRunner.query(`DROP TABLE "IBF-app"."dam-site"`);
    }

}
