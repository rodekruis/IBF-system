import { MigrationInterface, QueryRunner } from 'typeorm';

export class EapLinksDisasterSpecific1630664466068
  implements MigrationInterface {
  name = 'EapLinksDisasterSpecific1630664466068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" RENAME COLUMN "eapLink" TO "eapLinks"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "eapLinks"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "eapLinks" json NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "eapLinks"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "eapLinks" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" RENAME COLUMN "eapLinks" TO "eapLink"`,
    );
  }
}
