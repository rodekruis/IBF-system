import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLinesViews1747381242459 implements MigrationInterface {
  name = 'UpdateLinesViews1747381242459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'roads_exposure_per_lead_time', 'IBF-app'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."roads_exposure_per_lead_time"`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'buildings_exposure_per_lead_time', 'IBF-app'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."buildings_exposure_per_lead_time"`,
    );
    await queryRunner.query(`CREATE VIEW "IBF-app"."buildings_exposure_per_lead_time" AS SELECT line."referenceId"
        ,line."countryCodeISO3"
        ,line.geom
        , status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'buildings' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`);
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'IBF-app',
        'VIEW',
        'buildings_exposure_per_lead_time',
        'SELECT line."referenceId"\n        ,line."countryCodeISO3"\n        ,line.geom\n        , status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'buildings\' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
      ],
    );
    await queryRunner.query(`CREATE VIEW "IBF-app"."roads_exposure_per_lead_time" AS SELECT line."referenceId"
        ,line."countryCodeISO3"
        ,line.geom
        ,line.attributes->>'highway' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'roads' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`);
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'IBF-app',
        'VIEW',
        'roads_exposure_per_lead_time',
        'SELECT line."referenceId"\n        ,line."countryCodeISO3"\n        ,line.geom\n        ,line.attributes->>\'highway\' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'roads\' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
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
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'buildings_exposure_per_lead_time', 'IBF-app'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."buildings_exposure_per_lead_time"`,
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_exposure_per_lead_time" AS SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'buildings' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'IBF-app',
        'VIEW',
        'buildings_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'buildings\' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_exposure_per_lead_time" AS SELECT line."referenceId",line.geom,line.attributes->>'highway' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'roads' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'IBF-app',
        'VIEW',
        'roads_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom,line.attributes->>\'highway\' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'roads\' AND "line"."active" = true AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)',
      ],
    );
  }
}
