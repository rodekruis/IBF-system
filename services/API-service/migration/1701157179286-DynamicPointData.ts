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

    await queryRunner.query(`DROP TABLE "IBF-app"."point-data-dynamic-status"`);

    // NOTE: Do not prioritize this, but leave the code here for future reference
    // await queryRunner.query(`INSERT INTO "IBF-app"."point-data"
    // ("pointDataId", "countryCodeISO3", "pointDataCategory", "attributes", geom, "referenceId")
    // select id
    //   ,"countryCodeISO3"
    //   ,'glofas_stations'
    //   ,(cast('{"stationName":"' as varchar) || "stationName" || cast('","stationCode":"' || "stationCode" || '"}' as varchar))::json
    //   ,geom
    //   ,null
    // from "IBF-app"."glofas-station" `);

    // await queryRunner.query(`INSERT INTO "IBF-app"."dynamic-point-data"
    // ("dynamicPointDataId", "timestamp", "key", value, "pointPointDataId")
    // select uuid_generate_v4()
    //   ,'2023-12-11 14:29:06.012' -- NOTE: Put in here exact timestamp of main model run
    //   ,unnest(array['forecastLevel','forecastReturnPeriod','triggerLevel','eapAlertClass']) as key
    //   ,unnest(array[cast("forecastLevel" as varchar),cast("forecastReturnPeriod" as varchar),cast("triggerLevel" as varchar),"eapAlertClass"]) as value
    //   ,"glofasStationId"
    // from "IBF-app"."glofas-station-forecast" gsf `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."point-data-dynamic-status" ("pointDataDynamicStatusId" uuid NOT NULL DEFAULT uuid_generate_v4(), "referenceId" uuid NOT NULL, "timestamp" TIMESTAMP NOT NULL, "exposed" boolean NOT NULL, "leadTime" character varying, CONSTRAINT "PK_e4a407d1bb1af9141b6c659a985" PRIMARY KEY ("pointDataDynamicStatusId"))`,
    );

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
