import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventAreas1695644873629 implements MigrationInterface {
  name = 'EventAreas1695644873629';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."event-area" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventAreaName" character varying NOT NULL, "geom" geometry(MultiPolygon,4326) NOT NULL, "countryCodeISO3" character varying, "disasterType" character varying, CONSTRAINT "PK_82efc50403a4323242b10ef9743" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-area" ADD CONSTRAINT "FK_0ba76c0f92179c073fd0470acf2" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-area" ADD CONSTRAINT "FK_f45067e73967a28da2d9df26a5b" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-area" DROP CONSTRAINT "FK_f45067e73967a28da2d9df26a5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-area" DROP CONSTRAINT "FK_0ba76c0f92179c073fd0470acf2"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."event-area"`);
  }
}
