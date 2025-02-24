import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameStartDate1740405651841 implements MigrationInterface {
  name = 'RenameStartDate1740405651841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "CHK_c1c4bf373051cc47fca448ed4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "startDate" TO "firstIssuedDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "CHK_c428f39e04672da5f27caa50cf" CHECK ("firstIssuedDate" <= "endDate")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "CHK_c428f39e04672da5f27caa50cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" RENAME COLUMN "firstIssuedDate" TO "startDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "CHK_c1c4bf373051cc47fca448ed4f" CHECK (("startDate" <= "endDate"))`,
    );
  }
}
