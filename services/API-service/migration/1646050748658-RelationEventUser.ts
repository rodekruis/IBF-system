import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelationEventUser1646050748658 implements MigrationInterface {
  name = 'RelationEventUser1646050748658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "manualClosedDate" TO "manualStoppedDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "closed" TO "stopped"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD "userUserId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_2076f7f97998b0d104f8ecb1d56" FOREIGN KEY ("userUserId") REFERENCES "IBF-app"."user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_2076f7f97998b0d104f8ecb1d56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP COLUMN "userUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "stopped" TO "closed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "manualStoppedDate" TO "manualClosedDate"`,
    );
  }
}
