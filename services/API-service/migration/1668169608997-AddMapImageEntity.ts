import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMapImageEntity1668169608997 implements MigrationInterface {
  name = 'AddMapImageEntity1668169608997';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."event-map-image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" bytea NOT NULL, "eventName" character varying, "countryCodeISO3" character varying, "disasterType" character varying, CONSTRAINT "PK_c400921e03916d39f28bfcf733e" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" ADD CONSTRAINT "FK_205f4be5a99053e679383c46529" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" ADD CONSTRAINT "FK_6084f5dd92ca9a29e6fc504bb99" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" DROP CONSTRAINT "FK_6084f5dd92ca9a29e6fc504bb99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" DROP CONSTRAINT "FK_205f4be5a99053e679383c46529"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."event-map-image"`);
  }
}
