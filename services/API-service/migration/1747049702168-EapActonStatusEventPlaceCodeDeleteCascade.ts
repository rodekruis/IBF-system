import { MigrationInterface, QueryRunner } from 'typeorm';

export class EapActonStatusEventPlaceCodeDeleteCascade1747049702168
  implements MigrationInterface
{
  name = 'EapActonStatusEventPlaceCodeDeleteCascade1747049702168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_7542139f48d6fb143dc38afa81f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_7542139f48d6fb143dc38afa81f" FOREIGN KEY ("eventPlaceCodeEventPlaceCodeId") REFERENCES "IBF-app"."event-place-code"("eventPlaceCodeId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_7542139f48d6fb143dc38afa81f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_7542139f48d6fb143dc38afa81f" FOREIGN KEY ("eventPlaceCodeEventPlaceCodeId") REFERENCES "IBF-app"."event-place-code"("eventPlaceCodeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
