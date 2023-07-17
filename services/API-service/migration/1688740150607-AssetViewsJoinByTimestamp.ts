import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssetViewsJoinByTimestamp1688740150607
  implements MigrationInterface {
  name = 'AssetViewsJoinByTimestamp1688740150607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // delete views first
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_exposure_per_lead_time'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."roads_exposure_per_lead_time"`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_exposure_per_lead_time'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."buildings_exposure_per_lead_time"`,
    );

    // then recreate with new definition
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
      `CREATE VIEW "IBF-app"."roads_exposure_per_lead_time" AS SELECT line."referenceId",line.geom, line.attributes->>'highway' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = 'roads' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_exposure_per_lead_time',
        `SELECT line."referenceId",line.geom, line.attributes->>'highway' as "highway", status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId"  LEFT JOIN (SELECT status."leadTime" as "leadTime", MAX(timestamp) as max_timestamp FROM "IBF-app"."lines-data-dynamic-status" "status" LEFT JOIN "IBF-app"."lines-data" "line" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' GROUP BY status."leadTime") "max_timestamp" ON status."leadTime" = max_timestamp."leadTime" WHERE line."linesDataCategory" = \'roads\' AND ("status"."timestamp" = max_timestamp.max_timestamp OR "status"."timestamp" IS NULL)`,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_exposure_per_lead_time'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."roads_exposure_per_lead_time"`,
    );
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_exposure_per_lead_time'],
    );
    await queryRunner.query(
      `DROP VIEW "IBF-app"."buildings_exposure_per_lead_time"`,
    );

    // recreate with old definition (copied from previous migration file)
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_exposure_per_lead_time" AS SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_exposure_per_lead_time" AS SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_exposure_per_lead_time',
        'SELECT line."referenceId",line.geom, status."leadTime", COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' ORDER BY "status"."timestamp" DESC',
      ],
    );
  }
}
