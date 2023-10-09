import { MigrationInterface, QueryRunner } from "typeorm";

export class IsEventBased1696851685381 implements MigrationInterface {
    name = 'IsEventBased1696851685381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "IBF-app"."country-disaster-settings" ADD "isEventBased" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "isEventBased"`);
    }

}
