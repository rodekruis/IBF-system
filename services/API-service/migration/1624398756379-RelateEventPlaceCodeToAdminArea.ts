import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelateEventPlaceCodeToAdminArea1624398756379
  implements MigrationInterface {
  name = 'RelateEventPlaceCodeToAdminArea1624398756379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "placeCode" TO "adminAreaId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ADD CONSTRAINT "UQ_d6e1b1a1289262834bbcf965abf" UNIQUE ("placeCode")`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "adminAreaId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "adminAreaId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_5a63b6b3db5804740cca7d4c86f" FOREIGN KEY ("adminAreaId") REFERENCES "IBF-app"."admin-area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_5a63b6b3db5804740cca7d4c86f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "adminAreaId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "adminAreaId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" DROP CONSTRAINT "UQ_d6e1b1a1289262834bbcf965abf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "adminAreaId" TO "placeCode"`,
    );
  }
}
