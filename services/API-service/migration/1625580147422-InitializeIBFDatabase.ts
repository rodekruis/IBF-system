import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitializeIBFDatabase1625580147422 implements MigrationInterface {
  public name = 'InitializeIBFDatabase1625580147422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."disaster" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "disasterType" character varying NOT NULL, "label" character varying NOT NULL, "triggerUnit" character varying NOT NULL DEFAULT 'population', "actionsUnit" character varying NOT NULL DEFAULT 'population_affected', CONSTRAINT "PK_a292b0612c85e0e63ef3e00f121" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."lead-time" ("leadTimeId" uuid NOT NULL DEFAULT uuid_generate_v4(), "leadTimeName" character varying NOT NULL, "leadTimeLabel" character varying NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "UQ_99f233964fc47cef559c87702d7" UNIQUE ("leadTimeName"), CONSTRAINT "PK_d1ed3cdeab613cfb542732978ac" PRIMARY KEY ("leadTimeId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."admin-area" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminLevel" integer NOT NULL, "placeCode" character varying NOT NULL, "name" character varying, "placeCodeParent" character varying, "geom" geometry, "glofasStation" character varying, "countryCodeISO3" character varying, CONSTRAINT "UQ_d6e1b1a1289262834bbcf965abf" UNIQUE ("placeCode"), CONSTRAINT "PK_258a79d744ddcf28e9695b69ddf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."event-place-code" ("eventPlaceCodeId" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP NOT NULL, "actionsValue" double precision, "endDate" TIMESTAMP, "manualClosedDate" TIMESTAMP, "activeTrigger" boolean NOT NULL DEFAULT true, "closed" boolean NOT NULL DEFAULT false, "adminAreaId" uuid, CONSTRAINT "CHK_8f8a8806ec943690331219d9a3" CHECK ("startDate" <= "endDate"), CONSTRAINT "PK_3d2741bd5f49a669cc972d290a9" PRIMARY KEY ("eventPlaceCodeId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."area-of-focus" ("id" character varying NOT NULL, "label" character varying NOT NULL, "icon" character varying NOT NULL, CONSTRAINT "PK_5985abd7cc3539425c56a17f4b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."eap-action" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "label" character varying NOT NULL, "countryCodeISO3" character varying, "areaOfFocusId" character varying, CONSTRAINT "PK_d4c17c7a1e4892dfc3e81e6ace2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."eap-action-status" ("id" SERIAL NOT NULL, "status" boolean NOT NULL, "placeCode" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "actionCheckedId" integer, "eventPlaceCodeEventPlaceCodeId" uuid, "userUserId" uuid, CONSTRAINT "PK_1c64d8af0237cd169696355b2fa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "username" character varying NOT NULL, "firstName" character varying NOT NULL, "middleName" character varying, "lastName" character varying NOT NULL, "userRole" character varying NOT NULL DEFAULT 'guest', "userStatus" character varying NOT NULL DEFAULT 'active', "password" character varying NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "UQ_7c9d3bc7862fe81159d105091a7" UNIQUE ("email"), CONSTRAINT "UQ_09cdc2f534910e14de7705815a8" UNIQUE ("username"), CONSTRAINT "PK_66667789ef4c9bcf0a14bad41e6" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."notification_info" ("notificationInfoId" uuid NOT NULL DEFAULT uuid_generate_v4(), "logo" character varying NOT NULL, "triggerStatement" character varying NOT NULL, "linkSocialMediaType" character varying, "linkSocialMediaUrl" character varying, CONSTRAINT "PK_e3728e60bcd4ca913e178935710" PRIMARY KEY ("notificationInfoId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."country" ("countryId" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCodeISO3" character varying NOT NULL, "countryCodeISO2" character varying NOT NULL, "countryName" character varying NOT NULL, "countryStatus" character varying NOT NULL DEFAULT 'active', "adminLevels" integer array NOT NULL DEFAULT array[]::int[], "defaultAdminLevel" integer NOT NULL DEFAULT '1', "adminRegionLabels" json NOT NULL DEFAULT '{}', "eapLink" character varying, "eapAlertClasses" json, "countryLogos" text array NOT NULL DEFAULT array[]::text[], "countryBoundingBox" geometry NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "glofasStationInput" json, "notificationInfoNotificationInfoId" uuid, CONSTRAINT "UQ_a91f143cafe4d7efcb320200c8c" UNIQUE ("countryCodeISO3"), CONSTRAINT "UQ_b2775caab3139a7c73eb9e5f822" UNIQUE ("countryCodeISO2"), CONSTRAINT "UQ_c139b101355ae77e29e68ac2fcd" UNIQUE ("countryName"), CONSTRAINT "REL_85b594e72d0fe4d1e82ab45c38" UNIQUE ("notificationInfoNotificationInfoId"), CONSTRAINT "PK_432c63cc6aa6e60554711740d98" PRIMARY KEY ("countryId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "IBF-app"."admin-area-data_adminlevel_enum" AS ENUM('1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."admin-area-data" ("adminAreaDataId" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminLevel" "IBF-app"."admin-area-data_adminlevel_enum" NOT NULL, "placeCode" character varying NOT NULL, "indicator" character varying NOT NULL, "value" real, "countryCodeISO3" character varying, CONSTRAINT "PK_2edba2aeef71c8bc7da6ec4b34c" PRIMARY KEY ("adminAreaDataId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."admin-area-dynamic-data" ("adminAreaDynamicDataId" uuid NOT NULL DEFAULT uuid_generate_v4(), "adminLevel" integer NOT NULL, "placeCode" character varying NOT NULL, "indicator" character varying NOT NULL, "date" date NOT NULL, "value" real, "countryCodeISO3" character varying, "leadTime" character varying, CONSTRAINT "PK_1bf856d6c3940234e3629d0a697" PRIMARY KEY ("adminAreaDynamicDataId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."trigger-per-lead-time" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "leadTime" character varying NOT NULL, "triggered" boolean NOT NULL DEFAULT false, "countryCodeISO3" character varying, CONSTRAINT "PK_fd74009c6ae17c2663dcebdcc68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."glofas-station" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stationCode" character varying NOT NULL, "stationName" character varying, "triggerLevel" real, "threshold2Year" real, "threshold5Year" real, "threshold10Year" real, "threshold20Year" real, "lat" double precision, "lon" double precision, "geom" json, "countryCodeISO3" character varying, CONSTRAINT "UQ_87a234c5900e80eb2b4de5d4645" UNIQUE ("stationCode"), CONSTRAINT "PK_a8d5b550b150a7c6ba18c3ababc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."glofas-station-forecast" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "forecastLevel" double precision NOT NULL, "forecastProbability" double precision NOT NULL, "forecastTrigger" integer NOT NULL, "forecastReturnPeriod" integer, "leadTime" character varying, "glofasStationId" uuid, CONSTRAINT "PK_db45348e3311fa444b7ea54e283" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."health-site" ("healthSiteId" uuid NOT NULL DEFAULT uuid_generate_v4(), "countryCodeISO3" character varying NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "geom" character varying NOT NULL, CONSTRAINT "PK_6b3e5986dba06c99468006d88b3" PRIMARY KEY ("healthSiteId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."indicator-metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country_codes" character varying NOT NULL, "name" character varying NOT NULL, "label" character varying NOT NULL, "group" character varying NOT NULL, "icon" character varying NOT NULL, "weightedAvg" boolean NOT NULL, "active" boolean NOT NULL, "colorBreaks" json, "numberFormatMap" character varying NOT NULL, "aggregateIndicator" character varying NOT NULL, "numberFormatAggregate" character varying NOT NULL, "order" integer NOT NULL DEFAULT '1', "dynamic" boolean NOT NULL DEFAULT false, "unit" character varying, "lazyLoad" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b31f3d2465c1af802bfb2187dae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."layer-metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country_codes" character varying NOT NULL, "name" character varying NOT NULL, "label" character varying NOT NULL, "type" character varying NOT NULL, "legendColor" character varying, "leadTimeDependent" boolean, "active" character varying NOT NULL, CONSTRAINT "PK_6aedb87593cc1a6bb5110f790c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."rainfall-triggers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lat" real NOT NULL, "lon" real NOT NULL, "leadTime" character varying NOT NULL, "triggerLevel" real NOT NULL, "threshold99Perc" real, "threshold2Year" real, "threshold5Year" real, "threshold10Year" real, "threshold20Year" real, "threshold50Year" real, "threshold100Year" real, "countryCodeISO3" character varying, CONSTRAINT "PK_12e758f48956b6fcbfae3e1632c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."redcross-branch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "numberOfVolunteers" character varying, "contactPerson" character varying, "contactAddress" character varying, "contactNumber" character varying, "geom" json, "countryCodeISO3" character varying, CONSTRAINT "PK_bd835c7afd59ac09eb76de79a01" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."disaster_countries_country" ("disasterId" uuid NOT NULL, "countryCountryId" uuid NOT NULL, CONSTRAINT "PK_0d58da636f3a360d30417af7ee1" PRIMARY KEY ("disasterId", "countryCountryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eabdbaedd0f1ab02cd62a497f0" ON "IBF-app"."disaster_countries_country" ("disasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d86ecbd448c67e7a073addfef" ON "IBF-app"."disaster_countries_country" ("countryCountryId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."disaster_lead_times_lead-time" ("disasterId" uuid NOT NULL, "leadTimeLeadTimeId" uuid NOT NULL, CONSTRAINT "PK_ae6e7203169aa7f7a742acdd55e" PRIMARY KEY ("disasterId", "leadTimeLeadTimeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_739302068669f1bf974b527251" ON "IBF-app"."disaster_lead_times_lead-time" ("disasterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a0bcb7bf772c858087bfa66d2" ON "IBF-app"."disaster_lead_times_lead-time" ("leadTimeLeadTimeId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."user_countries" ("user" character varying NOT NULL, "country" character varying NOT NULL, CONSTRAINT "PK_1e1c0c9bc9d3c7cb0cf60d2a3c3" PRIMARY KEY ("user", "country"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef0f300496075ea89989df4ada" ON "IBF-app"."user_countries" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a40f86ca66b7eedc6d804895d" ON "IBF-app"."user_countries" ("country") `,
    );
    await queryRunner.query(
      `CREATE TABLE "IBF-app"."country_country_active_lead_times_lead-time" ("countryCountryId" uuid NOT NULL, "leadTimeLeadTimeId" uuid NOT NULL, CONSTRAINT "PK_1ac695fcc6c62128178dc5fe111" PRIMARY KEY ("countryCountryId", "leadTimeLeadTimeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f22589d6aae5ded050ce163acd" ON "IBF-app"."country_country_active_lead_times_lead-time" ("countryCountryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6022300394463d4ae76d6eff47" ON "IBF-app"."country_country_active_lead_times_lead-time" ("leadTimeLeadTimeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" ADD CONSTRAINT "FK_cfa012a21f9e6fbbe1837485444" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" ADD CONSTRAINT "FK_5a63b6b3db5804740cca7d4c86f" FOREIGN KEY ("adminAreaId") REFERENCES "IBF-app"."admin-area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_c514a2ce7157cd355fd0f3cfa38" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" ADD CONSTRAINT "FK_ea1d5223b78c745efdac9416250" FOREIGN KEY ("areaOfFocusId") REFERENCES "IBF-app"."area-of-focus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_55a128fe767d2e9b11a2a747f6b" FOREIGN KEY ("actionCheckedId") REFERENCES "IBF-app"."eap-action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_e4479700d56484427ed2743aed9" FOREIGN KEY ("eventPlaceCodeEventPlaceCodeId") REFERENCES "IBF-app"."event-place-code"("eventPlaceCodeId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" ADD CONSTRAINT "FK_8d2f52a583fce7a130fac31ff99" FOREIGN KEY ("userUserId") REFERENCES "IBF-app"."user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" ADD CONSTRAINT "FK_85b594e72d0fe4d1e82ab45c38b" FOREIGN KEY ("notificationInfoNotificationInfoId") REFERENCES "IBF-app"."notification_info"("notificationInfoId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" ADD CONSTRAINT "FK_d08206389dc3d452fd7e46b0b41" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_fd53fec7ec5be64fd8e108a21d3" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" ADD CONSTRAINT "FK_2157942d58db65199a34fea3c0b" FOREIGN KEY ("leadTime") REFERENCES "IBF-app"."lead-time"("leadTimeName") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" ADD CONSTRAINT "FK_dc5dcc95472db241e3dee7c4015" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "IBF-app"."rainfall-triggers" ADD CONSTRAINT "FK_858539e0985e52ef61e65426eca" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."redcross-branch" ADD CONSTRAINT "FK_13765eff136d64e7e0d2bb5c0e2" FOREIGN KEY ("countryCodeISO3") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" ADD CONSTRAINT "FK_eabdbaedd0f1ab02cd62a497f05" FOREIGN KEY ("disasterId") REFERENCES "IBF-app"."disaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" ADD CONSTRAINT "FK_4d86ecbd448c67e7a073addfef0" FOREIGN KEY ("countryCountryId") REFERENCES "IBF-app"."country"("countryId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_lead_times_lead-time" ADD CONSTRAINT "FK_739302068669f1bf974b5272517" FOREIGN KEY ("disasterId") REFERENCES "IBF-app"."disaster"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_lead_times_lead-time" ADD CONSTRAINT "FK_1a0bcb7bf772c858087bfa66d28" FOREIGN KEY ("leadTimeLeadTimeId") REFERENCES "IBF-app"."lead-time"("leadTimeId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" ADD CONSTRAINT "FK_ef0f300496075ea89989df4ada2" FOREIGN KEY ("user") REFERENCES "IBF-app"."user"("email") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" ADD CONSTRAINT "FK_2a40f86ca66b7eedc6d804895df" FOREIGN KEY ("country") REFERENCES "IBF-app"."country"("countryCodeISO3") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country_country_active_lead_times_lead-time" ADD CONSTRAINT "FK_f22589d6aae5ded050ce163acdc" FOREIGN KEY ("countryCountryId") REFERENCES "IBF-app"."country"("countryId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country_country_active_lead_times_lead-time" ADD CONSTRAINT "FK_6022300394463d4ae76d6eff47e" FOREIGN KEY ("leadTimeLeadTimeId") REFERENCES "IBF-app"."lead-time"("leadTimeId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country_country_active_lead_times_lead-time" DROP CONSTRAINT "FK_6022300394463d4ae76d6eff47e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country_country_active_lead_times_lead-time" DROP CONSTRAINT "FK_f22589d6aae5ded050ce163acdc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" DROP CONSTRAINT "FK_2a40f86ca66b7eedc6d804895df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."user_countries" DROP CONSTRAINT "FK_ef0f300496075ea89989df4ada2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_lead_times_lead-time" DROP CONSTRAINT "FK_1a0bcb7bf772c858087bfa66d28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_lead_times_lead-time" DROP CONSTRAINT "FK_739302068669f1bf974b5272517"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" DROP CONSTRAINT "FK_4d86ecbd448c67e7a073addfef0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."disaster_countries_country" DROP CONSTRAINT "FK_eabdbaedd0f1ab02cd62a497f05"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."redcross-branch" DROP CONSTRAINT "FK_13765eff136d64e7e0d2bb5c0e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."rainfall-triggers" DROP CONSTRAINT "FK_858539e0985e52ef61e65426eca"`,
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
      `ALTER TABLE "IBF-app"."trigger-per-lead-time" DROP CONSTRAINT "FK_dc5dcc95472db241e3dee7c4015"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_2157942d58db65199a34fea3c0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-dynamic-data" DROP CONSTRAINT "FK_fd53fec7ec5be64fd8e108a21d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area-data" DROP CONSTRAINT "FK_d08206389dc3d452fd7e46b0b41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."country" DROP CONSTRAINT "FK_85b594e72d0fe4d1e82ab45c38b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_8d2f52a583fce7a130fac31ff99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_e4479700d56484427ed2743aed9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action-status" DROP CONSTRAINT "FK_55a128fe767d2e9b11a2a747f6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_ea1d5223b78c745efdac9416250"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."eap-action" DROP CONSTRAINT "FK_c514a2ce7157cd355fd0f3cfa38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."event-place-code" DROP CONSTRAINT "FK_5a63b6b3db5804740cca7d4c86f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "IBF-app"."admin-area" DROP CONSTRAINT "FK_cfa012a21f9e6fbbe1837485444"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_6022300394463d4ae76d6eff47"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_f22589d6aae5ded050ce163acd"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."country_country_active_lead_times_lead-time"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_2a40f86ca66b7eedc6d804895d"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_ef0f300496075ea89989df4ada"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."user_countries"`);
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_1a0bcb7bf772c858087bfa66d2"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_739302068669f1bf974b527251"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."disaster_lead_times_lead-time"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_4d86ecbd448c67e7a073addfef"`,
    );
    await queryRunner.query(
      `DROP INDEX "IBF-app"."IDX_eabdbaedd0f1ab02cd62a497f0"`,
    );
    await queryRunner.query(
      `DROP TABLE "IBF-app"."disaster_countries_country"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."redcross-branch"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."rainfall-triggers"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."layer-metadata"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."indicator-metadata"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."health-site"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."glofas-station-forecast"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."glofas-station"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."trigger-per-lead-time"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."admin-area-dynamic-data"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."admin-area-data"`);
    await queryRunner.query(
      `DROP TYPE "IBF-app"."admin-area-data_adminlevel_enum"`,
    );
    await queryRunner.query(`DROP TABLE "IBF-app"."country"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."notification_info"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."user"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."eap-action-status"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."eap-action"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."area-of-focus"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."event-place-code"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."admin-area"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."lead-time"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."disaster"`);
  }
}
