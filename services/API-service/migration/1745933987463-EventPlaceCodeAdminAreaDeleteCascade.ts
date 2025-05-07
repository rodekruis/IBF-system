import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventPlaceCodeAdminAreaDeleteCascade1745933987463
  implements MigrationInterface
{
  name = 'EventPlaceCodeAdminAreaDeleteCascade1745933987463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_19f9033657394f08a52a1bee7b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_19f9033657394f08a52a1bee7b4" FOREIGN KEY ("adminAreaId") REFERENCES "IBF-app"."admin-area"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_19f9033657394f08a52a1bee7b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_19f9033657394f08a52a1bee7b4" FOREIGN KEY ("adminAreaId") REFERENCES "IBF-app"."admin-area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
