import { MigrationInterface, QueryRunner } from 'typeorm';

export class DroughtForecastMonths1645445288838 implements MigrationInterface {
  name = 'DroughtForecastMonths1645445288838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD "droughtForecastMonths" json`,
    );

    await queryRunner.query(
      `UPDATE "IBF-app"."country-disaster-settings" AS cds
      SET "droughtForecastMonths" = 
        case when cds."disasterType" = 'drought' 
          then case 
            when c."countryCodeISO3" = 'KEN' then jsonb '[3,10]'
            when c."countryCodeISO3" = 'ZWE' then jsonb '[4]'
          end
        end
      FROM "IBF-app".country AS c
      WHERE cds."countryCountryId" = c."countryId" `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP COLUMN "droughtForecastMonths"`,
    );
  }
}
