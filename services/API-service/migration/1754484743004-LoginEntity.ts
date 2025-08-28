import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginEntity1754484743004 implements MigrationInterface {
  name = 'LoginEntity1754484743004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."logins" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "code" integer NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "userUserId" uuid,
          CONSTRAINT "REL_cd8a4f84444e7d8ff0702bb880" UNIQUE ("userUserId"),
          CONSTRAINT "PK_edaf0bf87d9dd178f7a00cc801f" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."logins"
        ADD CONSTRAINT "FK_cd8a4f84444e7d8ff0702bb8801" FOREIGN KEY ("userUserId")
          REFERENCES "IBF-app"."user"("userId")
          ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."logins" DROP CONSTRAINT "FK_cd8a4f84444e7d8ff0702bb8801"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."logins"`);
  }
}
