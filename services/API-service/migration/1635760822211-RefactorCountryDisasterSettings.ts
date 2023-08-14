import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorCountryDisasterSettings1635760822211
  implements MigrationInterface
{
  name = 'RefactorCountryDisasterSettings1635760822211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "adminLevels"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "defaultAdminLevel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "eapAlertClasses"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP COLUMN "eapLinks"`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."country-disaster-settings" ("countryDisasterSettingsId" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminLevels" integer array NOT NULL DEFAULT array[]::int[], "defaultAdminLevel" integer NOT NULL DEFAULT '1', "eapLink" character varying NOT NULL DEFAULT '', "eapAlertClasses" json, "countryCountryId" uuid, "disasterType" character varying, CONSTRAINT "PK_3036f6bf205d65bc0ec77bc31ac" PRIMARY KEY ("countryDisasterSettingsId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ("countryDisasterSettingsCountryDisasterSettingsId" uuid NOT NULL, "leadTimeLeadTimeId" uuid NOT NULL, CONSTRAINT "PK_cf6cd43bae748d2ecb2b55081da" PRIMARY KEY ("countryDisasterSettingsCountryDisasterSettingsId", "leadTimeLeadTimeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ecf4785b4d6d533009e90db4f" ON "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ("countryDisasterSettingsCountryDisasterSettingsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0bef17d62a11200a9eeba7aeb8" ON "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ("leadTimeLeadTimeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD CONSTRAINT "FK_3178d9b33109d32045098a6e034" FOREIGN KEY ("countryCountryId") REFERENCES "IBF-app"."country"("countryId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD CONSTRAINT "FK_bcf4597e2fe1bc6da9cfabd2bb6" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ADD CONSTRAINT "FK_1ecf4785b4d6d533009e90db4ff" FOREIGN KEY ("countryDisasterSettingsCountryDisasterSettingsId") REFERENCES "IBF-app"."country-disaster-settings"("countryDisasterSettingsId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ADD CONSTRAINT "FK_0bef17d62a11200a9eeba7aeb8b" FOREIGN KEY ("leadTimeLeadTimeId") REFERENCES "IBF-app"."lead-time"("leadTimeId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" DROP CONSTRAINT "FK_0bef17d62a11200a9eeba7aeb8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" DROP CONSTRAINT "FK_1ecf4785b4d6d533009e90db4ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP CONSTRAINT "FK_bcf4597e2fe1bc6da9cfabd2bb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP CONSTRAINT "FK_3178d9b33109d32045098a6e034"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_0bef17d62a11200a9eeba7aeb8"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_1ecf4785b4d6d533009e90db4f"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."country-disaster-settings"`);
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "eapLinks" json NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "eapAlertClasses" json`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "defaultAdminLevel" json NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD "adminLevels" integer array NOT NULL DEFAULT ARRAY[]`,
    );
  }
}
