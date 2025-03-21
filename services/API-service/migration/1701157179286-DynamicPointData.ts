import { MigrationInterface, QueryRunner } from 'typeorm';

export class DynamicPointData1701157179286 implements MigrationInterface {
  name = 'DynamicPointData1701157179286';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."dynamic-point-data" ("dynamicPointDataId" uuid NOT NULL DEFAULT uuid_generate_v4(), "timestamp" TIMESTAMP NOT NULL, "key" character varying NOT NULL, "value" character varying, "pointPointDataId" uuid, "leadTime" character varying, CONSTRAINT "PK_4f51e8c4a1091afa35e3cc51b34" PRIMARY KEY ("dynamicPointDataId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."dynamic-point-data" ADD CONSTRAINT "FK_9aaa9be5dbe82b610209bcb456b" FOREIGN KEY ("pointPointDataId") REFERENCES "IBF-app"."point-data"("pointDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."dynamic-point-data" ADD CONSTRAINT "FK_289a1f52e25e270d9a28bd9d35a" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ca340240072b8ece6e7b8ae61" ON "IBF-app"."dynamic-point-data" ("timestamp") `,
    );

    // Migrate static + dynamic glofas data
    await queryRunner.query(`INSERT INTO "IBF-app"."point-data"
    ("pointDataId", "countryCodeISO3", "pointDataCategory", "attributes", geom, "referenceId")
    select id
      ,"countryCodeISO3"
      ,'glofas_stations'
      ,(cast('{"stationName":"' as varchar) || "stationName" || cast('","stationCode":"' || "stationCode" || '"}' as varchar))::json
      ,geom
      ,"stationCode"
    from "IBF-app"."glofas-station" `);

    await queryRunner.query(`INSERT INTO "IBF-app"."dynamic-point-data"
    ("dynamicPointDataId", "timestamp", "key", value, "pointPointDataId", "leadTime")
    select uuid_generate_v4()
      ,date
      ,unnest(array['forecastLevel','forecastReturnPeriod','triggerLevel','eapAlertClass']) as key
      ,unnest(array[cast("forecastLevel" as varchar),cast("forecastReturnPeriod" as varchar),cast("triggerLevel" as varchar),"eapAlertClass"]) as value
      ,"glofasStationId"
      ,"leadTime"
    from "IBF-app"."glofas-station-forecast" gsf `);

    await queryRunner.query(`DROP TABLE "IBF-app"."point-data-dynamic-status"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_9ca340240072b8ece6e7b8ae61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."dynamic-point-data" DROP CONSTRAINT "FK_289a1f52e25e270d9a28bd9d35a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."dynamic-point-data" DROP CONSTRAINT "FK_9aaa9be5dbe82b610209bcb456b"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."dynamic-point-data"`);
  }
}
