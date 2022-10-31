import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexOnPlaceCode1667228268084 implements MigrationInterface {
  name = 'IndexOnPlaceCode1667228268084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_d6e1b1a1289262834bbcf965ab" ON "IBF-app"."admin-area" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27779072c7848b23ad40986821" ON "IBF-app"."eap-action-status" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9f2352db5061f99390c9cc9fa" ON "IBF-app"."admin-area-data" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d62ad43ab706ccc3b2835b85c" ON "IBF-app"."admin-area-dynamic-data" ("placeCode") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_2d62ad43ab706ccc3b2835b85c"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_a9f2352db5061f99390c9cc9fa"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_27779072c7848b23ad40986821"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_d6e1b1a1289262834bbcf965ab"`,
    );
  }
}
