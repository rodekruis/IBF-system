import { MigrationInterface, QueryRunner } from 'typeorm';

export class TyphoonTrack1637314459310 implements MigrationInterface {
  name = 'TyphoonTrack1637314459310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."typhoon-track" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "timestamp" TIMESTAMP, "timestampOfTrackpoint" TIMESTAMP, "geom" json, "countryCodeISO3" character varying, "leadTime" character varying, CONSTRAINT "PK_447dc3696ed34ce508bfd015413" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD CONSTRAINT "FK_9b4452b4cde79b54c8b8e7e3b37" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD CONSTRAINT "FK_89338135c98f252d91a508d624d" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP CONSTRAINT "FK_89338135c98f252d91a508d624d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP CONSTRAINT "FK_9b4452b4cde79b54c8b8e7e3b37"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."typhoon-track"`);
  }
}
