import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAreaOfFocusEntity1737716825902
  implements MigrationInterface
{
  name = 'RemoveAreaOfFocusEntity1737716825902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_f3ce61c374e05d7b8b05b8485d2"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_f3ce61c374e05d7b8b05b8485d2" FOREIGN KEY ("areaOfFocusId") REFERENCES "IBF-app"."area-of-focus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
