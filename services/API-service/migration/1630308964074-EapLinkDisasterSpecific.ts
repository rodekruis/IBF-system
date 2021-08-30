import {MigrationInterface, QueryRunner} from "typeorm";

export class EapLinkDisasterSpecific1630308964074 implements MigrationInterface {
    name = 'EapLinkDisasterSpecific1630308964074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" RENAME COLUMN "eapLink" TO "eapLinks"`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."adminLevels" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "adminLevels" SET DEFAULT array[]::int[]`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" DROP COLUMN "eapLinks"`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ADD "eapLinks" json NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT array[]::text[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."created" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryBoundingBox" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryLogos" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."countryLogos" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" DROP COLUMN "eapLinks"`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ADD "eapLinks" character varying`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" ALTER COLUMN "adminLevels" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."country"."adminLevels" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."user"."created" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."eap-action-status"."timestamp" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."admin-area"."geom" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "IBF-app"."lead-time"."created" IS NULL`);
        await queryRunner.query(`ALTER TABLE "IBF-app"."country" RENAME COLUMN "eapLinks" TO "eapLink"`);
    }

}
