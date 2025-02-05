import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLeadTimeEntity1737713818319 implements MigrationInterface {
  name = 'RemoveLeadTimeEntity1737713818319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_cb6c2fc0f20bcf164afc3e0301b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" DROP CONSTRAINT "FK_2456d6fa601344982bacf47f6b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."dynamic-point-data" DROP CONSTRAINT "FK_289a1f52e25e270d9a28bd9d35a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP CONSTRAINT "FK_7911edcf74dd1da5905dbc7e44e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "activeLeadTimes" json`,
    );

    // Drop old tables
    await queryRunner.query(
      `DROP TABLE "IBF-app"."disaster_lead_times_lead-time"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."country_country_active_lead_times_lead-time"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."glofas-station-forecast"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."lead-time"`);

    await queryRunner.query(`DROP TABLE "IBF-app"."dam-site"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."evacuation-center"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."glofas-station"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."health-site"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."rainfall-triggers"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."redcross-branch"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "activeLeadTimes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD CONSTRAINT "FK_7911edcf74dd1da5905dbc7e44e" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."dynamic-point-data" ADD CONSTRAINT "FK_289a1f52e25e270d9a28bd9d35a" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" ADD CONSTRAINT "FK_2456d6fa601344982bacf47f6b9" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_cb6c2fc0f20bcf164afc3e0301b" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
