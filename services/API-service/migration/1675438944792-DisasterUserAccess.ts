import { MigrationInterface, QueryRunner } from 'typeorm';

export class DisasterUserAccess1675438944792 implements MigrationInterface {
  name = 'DisasterUserAccess1675438944792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."user_disaster_types" ("user" character varying NOT NULL, "disasterType" character varying NOT NULL, CONSTRAINT "PK_829f46c44dfff4e64e2dba258d7" PRIMARY KEY ("user", "disasterType"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4fa8efbed0cef440b9d87180f7" ON "IBF-app"."user_disaster_types" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_934c918ce26115e97a66cd9da2" ON "IBF-app"."user_disaster_types" ("disasterType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" ADD CONSTRAINT "FK_4fa8efbed0cef440b9d87180f73" FOREIGN KEY ("user") REFERENCES "IBF-app"."user"("email") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" ADD CONSTRAINT "FK_934c918ce26115e97a66cd9da2e" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" DROP CONSTRAINT "FK_934c918ce26115e97a66cd9da2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" DROP CONSTRAINT "FK_4fa8efbed0cef440b9d87180f73"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_934c918ce26115e97a66cd9da2"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_4fa8efbed0cef440b9d87180f7"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."user_disaster_types"`);
  }
}
