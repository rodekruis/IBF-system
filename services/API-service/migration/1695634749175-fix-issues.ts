import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixIssues1695634749175 implements MigrationInterface {
  name = 'FixIssues1695634749175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'roads_exposure_per_lead_time', 'IBF-app'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."roads_exposure_per_lead_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" DROP CONSTRAINT "FK_cfa012a21f9e6fbbe1837485444"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_1b74fc5a35619f3551ea3faac7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_2076f7f97998b0d104f8ecb1d56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_5a63b6b3db5804740cca7d4c86f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_61c802704b8e1e762e8756bc18e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_c514a2ce7157cd355fd0f3cfa38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_ea1d5223b78c745efdac9416250"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_55a128fe767d2e9b11a2a747f6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_8d2f52a583fce7a130fac31ff99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_e4479700d56484427ed2743aed9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP CONSTRAINT "FK_3178d9b33109d32045098a6e034"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP CONSTRAINT "FK_bcf4597e2fe1bc6da9cfabd2bb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP CONSTRAINT "FK_85b594e72d0fe4d1e82ab45c38b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" DROP CONSTRAINT "FK_d08206389dc3d452fd7e46b0b41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_2157942d58db65199a34fea3c0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_865ce419c854bdee5c1b32efe8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_fd53fec7ec5be64fd8e108a21d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP CONSTRAINT "FK_cd7ce5b45643af2d31f48fe6120"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP CONSTRAINT "FK_fef81fb5b0229051f997cda75ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP CONSTRAINT "FK_b1d13e2a6eb9254748dc59d96b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP CONSTRAINT "FK_a8f44aa44cadc9bb115221f4610"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP CONSTRAINT "FK_dc5dcc95472db241e3dee7c4015"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" DROP CONSTRAINT "FK_205f4be5a99053e679383c46529"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" DROP CONSTRAINT "FK_6084f5dd92ca9a29e6fc504bb99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" DROP CONSTRAINT "FK_72b1a0d51cd5213f1700263443e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" DROP CONSTRAINT "FK_7809876cae5bd4cae47851c2105"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP CONSTRAINT "FK_89338135c98f252d91a508d624d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP CONSTRAINT "FK_9b4452b4cde79b54c8b8e7e3b37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" DROP CONSTRAINT "FK_949d762f9a5c67832429fb8c09c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" DROP CONSTRAINT "FK_e4861c75f7e07581bd25ea14560"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."rainfall-triggers" DROP CONSTRAINT "FK_858539e0985e52ef61e65426eca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" DROP CONSTRAINT "FK_4d86ecbd448c67e7a073addfef0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" DROP CONSTRAINT "FK_eabdbaedd0f1ab02cd62a497f05"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" DROP CONSTRAINT "FK_2a40f86ca66b7eedc6d804895df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" DROP CONSTRAINT "FK_ef0f300496075ea89989df4ada2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" DROP CONSTRAINT "FK_4fa8efbed0cef440b9d87180f73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" DROP CONSTRAINT "FK_934c918ce26115e97a66cd9da2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" DROP CONSTRAINT "FK_0bef17d62a11200a9eeba7aeb8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" DROP CONSTRAINT "FK_1ecf4785b4d6d533009e90db4ff"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_d6e1b1a1289262834bbcf965ab"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_27779072c7848b23ad40986821"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_a9f2352db5061f99390c9cc9fa"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_2d62ad43ab706ccc3b2835b85c"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_f61bb4749d5419c6613e52ada4"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_7809876cae5bd4cae47851c210"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_80b10cb4cc8d184fb7ec0e5bd2"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_eabdbaedd0f1ab02cd62a497f0"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_4d86ecbd448c67e7a073addfef"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_2a40f86ca66b7eedc6d804895d"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_ef0f300496075ea89989df4ada"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_4fa8efbed0cef440b9d87180f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_934c918ce26115e97a66cd9da2"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_0bef17d62a11200a9eeba7aeb8"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_1ecf4785b4d6d533009e90db4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "CHK_8f8a8806ec943690331219d9a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ALTER COLUMN "triggerUnit" SET DEFAULT 'population_affected'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ALTER COLUMN "timestamp" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ALTER COLUMN "created" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lead-time" ALTER COLUMN "created" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ALTER COLUMN "disasterType" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ALTER COLUMN "adminLevels" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry(Polygon,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "created" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "triggerLevel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "triggerLevel" double precision NOT NULL DEFAULT '0'`,
    );
    // added manually: drop view temporarily to change column type
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_exposure_per_lead_time'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."buildings_exposure_per_lead_time"`,
    );
    // change column type
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data" ALTER COLUMN "geom" TYPE geometry(GeometryCollection,4326)`,
    );
    // then recreate with same definition
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_exposure_per_lead_time" AS SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'buildings' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'buildings\' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
      ],
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c203fe244fa72c9654113d24c" ON "IBF-app"."admin-area" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aaaaa52aa45cdd93ce5e840318" ON "IBF-app"."eap-action-status" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ee8f6ec15704296341bb6d616" ON "IBF-app"."admin-area-data" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d60a8ed24b45b80eab8320638" ON "IBF-app"."admin-area-dynamic-data" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4329bde988b3ad9a377be801af" ON "IBF-app"."lines-data" USING GiST ("geom") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2fdcd4f469eb9c5f1041a84dba" ON "IBF-app"."lines-data-dynamic-status" ("timestamp") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2456d6fa601344982bacf47f6b" ON "IBF-app"."lines-data-dynamic-status" ("leadTime") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0dca4ccdc5778bb62da77db98c" ON "IBF-app"."disaster_countries_country" ("disasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e96c68c20fb00354d7265b4cb5" ON "IBF-app"."disaster_countries_country" ("countryCountryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f1026b6a60ac9c291d2aa6707" ON "IBF-app"."user_countries" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87a70dd9f6abcd9907d411c158" ON "IBF-app"."user_countries" ("country") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d3af9534ed2b6b5c9430e5858" ON "IBF-app"."user_disaster_types" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ccea295c5c80cb79f884b1384" ON "IBF-app"."user_disaster_types" ("disasterType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7b2a4a8553c90c325b5ca9ecb1" ON "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ("countryDisasterSettingsCountryDisasterSettingsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f7275becced300a5038a70e01" ON "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ("leadTimeLeadTimeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "CHK_c1c4bf373051cc47fca448ed4f" CHECK ("startDate" <= "endDate")`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ADD CONSTRAINT "FK_a0314ac4916582a14c972e95d8d" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_19f9033657394f08a52a1bee7b4" FOREIGN KEY ("adminAreaId") REFERENCES "IBF-app"."admin-area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_40723c9655d703cfd4cd154315e" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_7b8004decab09c0f9173fe7e813" FOREIGN KEY ("userUserId") REFERENCES "IBF-app"."user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_284820c007d9d366bdebaa387e7" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_83db7c4bf6e68211c656c39b0ec" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_f3ce61c374e05d7b8b05b8485d2" FOREIGN KEY ("areaOfFocusId") REFERENCES "IBF-app"."area-of-focus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_48b8942086ed0fc21db72bbe040" FOREIGN KEY ("actionCheckedId") REFERENCES "IBF-app"."eap-action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_7542139f48d6fb143dc38afa81f" FOREIGN KEY ("eventPlaceCodeEventPlaceCodeId") REFERENCES "IBF-app"."event-place-code"("eventPlaceCodeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_c6da72bdd0eb2a63d356a9348f8" FOREIGN KEY ("userUserId") REFERENCES "IBF-app"."user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD CONSTRAINT "FK_14933d99cd85c2dbcfe796f50e6" FOREIGN KEY ("countryCountryId") REFERENCES "IBF-app"."country"("countryId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD CONSTRAINT "FK_c1a601d0d9242409d404886511c" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD CONSTRAINT "FK_5639c51c1ab26d5a0e5d7f34ced" FOREIGN KEY ("notificationInfoNotificationInfoId") REFERENCES "IBF-app"."notification_info"("notificationInfoId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" ADD CONSTRAINT "FK_380dc19a599d9d6cb391487c161" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_1f44064989a08d53e5aef36c9c5" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_15be2800e7e6847563ad88516ec" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_cb6c2fc0f20bcf164afc3e0301b" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD CONSTRAINT "FK_40c0c5d171dccc523e6e0caa024" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD CONSTRAINT "FK_565fcb8851a0a26b0af52629ee3" FOREIGN KEY ("glofasStationId") REFERENCES "IBF-app"."glofas-station"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD CONSTRAINT "FK_70740280401539105b15f3bc66a" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD CONSTRAINT "FK_3cae353eb56d44a19f3528a59b2" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD CONSTRAINT "FK_d7bde05c87df7b533a1c4b783ac" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" ADD CONSTRAINT "FK_07444475442c33f32d140ee79e0" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" ADD CONSTRAINT "FK_796e16c2ab827116a700eb6f334" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" ADD CONSTRAINT "FK_2604c7b535558919c5036fbbeb0" FOREIGN KEY ("referenceId") REFERENCES "IBF-app"."lines-data"("linesDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" ADD CONSTRAINT "FK_2456d6fa601344982bacf47f6b9" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD CONSTRAINT "FK_2c508e1ef837a80a84a6d716f1e" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD CONSTRAINT "FK_7911edcf74dd1da5905dbc7e44e" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" ADD CONSTRAINT "FK_dce21e230807076cdc7f00e6771" FOREIGN KEY ("referenceId") REFERENCES "IBF-app"."point-data"("pointDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" ADD CONSTRAINT "FK_1331d45cb8839c05482735441a7" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."rainfall-triggers" ADD CONSTRAINT "FK_58fad116b1b098a6bf29541f5c3" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" ADD CONSTRAINT "FK_0dca4ccdc5778bb62da77db98cb" FOREIGN KEY ("disasterId") REFERENCES "IBF-app"."disaster"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" ADD CONSTRAINT "FK_e96c68c20fb00354d7265b4cb55" FOREIGN KEY ("countryCountryId") REFERENCES "IBF-app"."country"("countryId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" ADD CONSTRAINT "FK_3f1026b6a60ac9c291d2aa67076" FOREIGN KEY ("user") REFERENCES "IBF-app"."user"("email") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" ADD CONSTRAINT "FK_87a70dd9f6abcd9907d411c1587" FOREIGN KEY ("country") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" ADD CONSTRAINT "FK_5d3af9534ed2b6b5c9430e58588" FOREIGN KEY ("user") REFERENCES "IBF-app"."user"("email") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" ADD CONSTRAINT "FK_6ccea295c5c80cb79f884b1384d" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ADD CONSTRAINT "FK_7b2a4a8553c90c325b5ca9ecb18" FOREIGN KEY ("countryDisasterSettingsCountryDisasterSettingsId") REFERENCES "IBF-app"."country-disaster-settings"("countryDisasterSettingsId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ADD CONSTRAINT "FK_6f7275becced300a5038a70e01d" FOREIGN KEY ("leadTimeLeadTimeId") REFERENCES "IBF-app"."lead-time"("leadTimeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_exposure_per_lead_time" AS SELECT line."referenceId",line.geom,line.attributes->>'highway' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'roads' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'IBF-app',
        'VIEW',
        'roads_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom,line.attributes->>\'highway\' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'roads\' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'roads_exposure_per_lead_time', 'IBF-app'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."roads_exposure_per_lead_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" DROP CONSTRAINT "FK_6f7275becced300a5038a70e01d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" DROP CONSTRAINT "FK_7b2a4a8553c90c325b5ca9ecb18"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" DROP CONSTRAINT "FK_6ccea295c5c80cb79f884b1384d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" DROP CONSTRAINT "FK_5d3af9534ed2b6b5c9430e58588"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" DROP CONSTRAINT "FK_87a70dd9f6abcd9907d411c1587"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" DROP CONSTRAINT "FK_3f1026b6a60ac9c291d2aa67076"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" DROP CONSTRAINT "FK_e96c68c20fb00354d7265b4cb55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" DROP CONSTRAINT "FK_0dca4ccdc5778bb62da77db98cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."rainfall-triggers" DROP CONSTRAINT "FK_58fad116b1b098a6bf29541f5c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" DROP CONSTRAINT "FK_1331d45cb8839c05482735441a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" DROP CONSTRAINT "FK_dce21e230807076cdc7f00e6771"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP CONSTRAINT "FK_7911edcf74dd1da5905dbc7e44e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" DROP CONSTRAINT "FK_2c508e1ef837a80a84a6d716f1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" DROP CONSTRAINT "FK_2456d6fa601344982bacf47f6b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" DROP CONSTRAINT "FK_2604c7b535558919c5036fbbeb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" DROP CONSTRAINT "FK_796e16c2ab827116a700eb6f334"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" DROP CONSTRAINT "FK_07444475442c33f32d140ee79e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP CONSTRAINT "FK_d7bde05c87df7b533a1c4b783ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP CONSTRAINT "FK_3cae353eb56d44a19f3528a59b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" DROP CONSTRAINT "FK_70740280401539105b15f3bc66a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP CONSTRAINT "FK_565fcb8851a0a26b0af52629ee3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP CONSTRAINT "FK_40c0c5d171dccc523e6e0caa024"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_cb6c2fc0f20bcf164afc3e0301b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_15be2800e7e6847563ad88516ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_1f44064989a08d53e5aef36c9c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" DROP CONSTRAINT "FK_380dc19a599d9d6cb391487c161"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP CONSTRAINT "FK_5639c51c1ab26d5a0e5d7f34ced"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP CONSTRAINT "FK_c1a601d0d9242409d404886511c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" DROP CONSTRAINT "FK_14933d99cd85c2dbcfe796f50e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_c6da72bdd0eb2a63d356a9348f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_7542139f48d6fb143dc38afa81f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_48b8942086ed0fc21db72bbe040"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_f3ce61c374e05d7b8b05b8485d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_83db7c4bf6e68211c656c39b0ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_284820c007d9d366bdebaa387e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_7b8004decab09c0f9173fe7e813"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_40723c9655d703cfd4cd154315e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_19f9033657394f08a52a1bee7b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" DROP CONSTRAINT "FK_a0314ac4916582a14c972e95d8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "CHK_c1c4bf373051cc47fca448ed4f"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_6f7275becced300a5038a70e01"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_7b2a4a8553c90c325b5ca9ecb1"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_6ccea295c5c80cb79f884b1384"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_5d3af9534ed2b6b5c9430e5858"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_87a70dd9f6abcd9907d411c158"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_3f1026b6a60ac9c291d2aa6707"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_e96c68c20fb00354d7265b4cb5"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_0dca4ccdc5778bb62da77db98c"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_2456d6fa601344982bacf47f6b"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_2fdcd4f469eb9c5f1041a84dba"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_4329bde988b3ad9a377be801af"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_1d60a8ed24b45b80eab8320638"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_5ee8f6ec15704296341bb6d616"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_aaaaa52aa45cdd93ce5e840318"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_2c203fe244fa72c9654113d24c"`,
    );
    // added manually: drop view temporarily to change column type
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_exposure_per_lead_time'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."buildings_exposure_per_lead_time"`,
    );
    // change column type
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data" ALTER COLUMN "geom" TYPE geometry(GEOMETRY,0)`,
    );
    // then recreate with same definition
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_exposure_per_lead_time" AS SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'buildings' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'buildings\' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
      ],
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" DROP COLUMN "triggerLevel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD "triggerLevel" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "created" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ALTER COLUMN "countryBoundingBox" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ALTER COLUMN "adminLevels" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ALTER COLUMN "disasterType" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lead-time" ALTER COLUMN "created" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user" ALTER COLUMN "created" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster" ALTER COLUMN "triggerUnit" SET DEFAULT 'population'`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ALTER COLUMN "geom" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "CHK_8f8a8806ec943690331219d9a3" CHECK (("startDate" <= "endDate"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ecf4785b4d6d533009e90db4f" ON "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ("countryDisasterSettingsCountryDisasterSettingsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0bef17d62a11200a9eeba7aeb8" ON "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ("leadTimeLeadTimeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_934c918ce26115e97a66cd9da2" ON "IBF-app"."user_disaster_types" ("disasterType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4fa8efbed0cef440b9d87180f7" ON "IBF-app"."user_disaster_types" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef0f300496075ea89989df4ada" ON "IBF-app"."user_countries" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a40f86ca66b7eedc6d804895d" ON "IBF-app"."user_countries" ("country") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d86ecbd448c67e7a073addfef" ON "IBF-app"."disaster_countries_country" ("countryCountryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eabdbaedd0f1ab02cd62a497f0" ON "IBF-app"."disaster_countries_country" ("disasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_80b10cb4cc8d184fb7ec0e5bd2" ON "IBF-app"."lines-data-dynamic-status" ("timestamp") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7809876cae5bd4cae47851c210" ON "IBF-app"."lines-data-dynamic-status" ("leadTime") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f61bb4749d5419c6613e52ada4" ON "IBF-app"."lines-data" USING GiST ("geom") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d62ad43ab706ccc3b2835b85c" ON "IBF-app"."admin-area-dynamic-data" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9f2352db5061f99390c9cc9fa" ON "IBF-app"."admin-area-data" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27779072c7848b23ad40986821" ON "IBF-app"."eap-action-status" ("placeCode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d6e1b1a1289262834bbcf965ab" ON "IBF-app"."admin-area" ("placeCode") `,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ADD CONSTRAINT "FK_1ecf4785b4d6d533009e90db4ff" FOREIGN KEY ("countryDisasterSettingsCountryDisasterSettingsId") REFERENCES "IBF-app"."country-disaster-settings"("countryDisasterSettingsId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings_active_lead_times_lead-time" ADD CONSTRAINT "FK_0bef17d62a11200a9eeba7aeb8b" FOREIGN KEY ("leadTimeLeadTimeId") REFERENCES "IBF-app"."lead-time"("leadTimeId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" ADD CONSTRAINT "FK_934c918ce26115e97a66cd9da2e" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_disaster_types" ADD CONSTRAINT "FK_4fa8efbed0cef440b9d87180f73" FOREIGN KEY ("user") REFERENCES "IBF-app"."user"("email") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" ADD CONSTRAINT "FK_ef0f300496075ea89989df4ada2" FOREIGN KEY ("user") REFERENCES "IBF-app"."user"("email") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" ADD CONSTRAINT "FK_2a40f86ca66b7eedc6d804895df" FOREIGN KEY ("country") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" ADD CONSTRAINT "FK_eabdbaedd0f1ab02cd62a497f05" FOREIGN KEY ("disasterId") REFERENCES "IBF-app"."disaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" ADD CONSTRAINT "FK_4d86ecbd448c67e7a073addfef0" FOREIGN KEY ("countryCountryId") REFERENCES "IBF-app"."country"("countryId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."rainfall-triggers" ADD CONSTRAINT "FK_858539e0985e52ef61e65426eca" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" ADD CONSTRAINT "FK_e4861c75f7e07581bd25ea14560" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."point-data-dynamic-status" ADD CONSTRAINT "FK_949d762f9a5c67832429fb8c09c" FOREIGN KEY ("referenceId") REFERENCES "IBF-app"."point-data"("pointDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD CONSTRAINT "FK_9b4452b4cde79b54c8b8e7e3b37" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."typhoon-track" ADD CONSTRAINT "FK_89338135c98f252d91a508d624d" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" ADD CONSTRAINT "FK_7809876cae5bd4cae47851c2105" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."lines-data-dynamic-status" ADD CONSTRAINT "FK_72b1a0d51cd5213f1700263443e" FOREIGN KEY ("referenceId") REFERENCES "IBF-app"."lines-data"("linesDataId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" ADD CONSTRAINT "FK_6084f5dd92ca9a29e6fc504bb99" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-map-image" ADD CONSTRAINT "FK_205f4be5a99053e679383c46529" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD CONSTRAINT "FK_dc5dcc95472db241e3dee7c4015" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD CONSTRAINT "FK_a8f44aa44cadc9bb115221f4610" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station" ADD CONSTRAINT "FK_b1d13e2a6eb9254748dc59d96b2" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD CONSTRAINT "FK_fef81fb5b0229051f997cda75ac" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."glofas-station-forecast" ADD CONSTRAINT "FK_cd7ce5b45643af2d31f48fe6120" FOREIGN KEY ("glofasStationId") REFERENCES "IBF-app"."glofas-station"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_fd53fec7ec5be64fd8e108a21d3" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_865ce419c854bdee5c1b32efe8d" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_2157942d58db65199a34fea3c0b" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" ADD CONSTRAINT "FK_d08206389dc3d452fd7e46b0b41" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD CONSTRAINT "FK_85b594e72d0fe4d1e82ab45c38b" FOREIGN KEY ("notificationInfoNotificationInfoId") REFERENCES "IBF-app"."notification_info"("notificationInfoId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD CONSTRAINT "FK_bcf4597e2fe1bc6da9cfabd2bb6" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country-disaster-settings" ADD CONSTRAINT "FK_3178d9b33109d32045098a6e034" FOREIGN KEY ("countryCountryId") REFERENCES "IBF-app"."country"("countryId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_e4479700d56484427ed2743aed9" FOREIGN KEY ("eventPlaceCodeEventPlaceCodeId") REFERENCES "IBF-app"."event-place-code"("eventPlaceCodeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_8d2f52a583fce7a130fac31ff99" FOREIGN KEY ("userUserId") REFERENCES "IBF-app"."user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_55a128fe767d2e9b11a2a747f6b" FOREIGN KEY ("actionCheckedId") REFERENCES "IBF-app"."eap-action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_ea1d5223b78c745efdac9416250" FOREIGN KEY ("areaOfFocusId") REFERENCES "IBF-app"."area-of-focus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_c514a2ce7157cd355fd0f3cfa38" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_61c802704b8e1e762e8756bc18e" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_5a63b6b3db5804740cca7d4c86f" FOREIGN KEY ("adminAreaId") REFERENCES "IBF-app"."admin-area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_2076f7f97998b0d104f8ecb1d56" FOREIGN KEY ("userUserId") REFERENCES "IBF-app"."user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_1b74fc5a35619f3551ea3faac7c" FOREIGN KEY ("disasterType") REFERENCES "IBF-app"."disaster"("disasterType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ADD CONSTRAINT "FK_cfa012a21f9e6fbbe1837485444" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_exposure_per_lead_time" AS SELECT line."referenceId",line.geom, line.attributes->>'highway' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'roads' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'IBF-app',
        'VIEW',
        'roads_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom, line.attributes->>\'highway\' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'roads\' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
      ],
    );
  }
}
