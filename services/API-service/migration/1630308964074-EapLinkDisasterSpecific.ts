import { MigrationInterface, QueryRunner } from 'typeorm';

export class EapLinkDisasterSpecific1630308964074
  implements MigrationInterface {
  name = 'EapLinkDisasterSpecific1630308964074';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" RENAME COLUMN "eapLink" TO "eapLinks"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" RENAME COLUMN "eapLinks" TO "eapLink"`,
    );
  }
}
