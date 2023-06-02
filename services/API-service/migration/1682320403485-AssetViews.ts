import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssetViews1682320403485 implements MigrationInterface {
  name = 'AssetViews1682320403485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "IBF-app"."typeorm_metadata" (
            "type" varchar(255) NOT NULL,
            "database" varchar(255) DEFAULT NULL,
            "schema" varchar(255) DEFAULT NULL,
            "table" varchar(255) DEFAULT NULL,
            "name" varchar(255) DEFAULT NULL,
            "value" text
        )`);
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour1" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '1-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour1',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'1-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour2" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '2-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour2',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'2-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour3" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '3-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour3',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'3-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour4" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '4-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour4',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'4-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour5" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '5-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour5',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'5-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour6" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '6-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour6',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'6-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour7" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '7-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour7',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'7-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour8" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '8-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour8',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'8-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour9" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '9-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour9',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'9-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour10" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '10-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour10',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'10-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour11" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '11-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour11',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'11-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour12" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '12-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour12',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'12-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour24" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '24-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour24',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'24-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."buildings_hour48" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'buildings' AND (status."leadTime" IS NULL OR status."leadTime" = '48-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'buildings_hour48',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'buildings\' AND (status."leadTime" IS NULL OR status."leadTime" = \'48-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour1" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '1-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour1',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'1-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour2" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '2-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour2',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'2-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour3" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '3-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour3',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'3-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour4" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '4-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour4',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'4-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour5" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '5-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour5',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'5-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour6" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '6-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour6',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'6-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour7" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '7-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour7',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'7-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour8" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '8-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour8',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'8-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour9" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '9-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour9',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'9-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour10" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '10-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour10',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'10-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour11" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '11-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour11',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'11-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour12" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '12-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour12',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'12-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );

    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour24" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '24-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour24',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'24-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
    await queryRunner.query(
      `CREATE VIEW "IBF-app"."roads_hour48" AS SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = 'roads' AND (status."leadTime" IS NULL OR status."leadTime" = '48-hour') ORDER BY "status"."timestamp" DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "IBF-app"."typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'IBF-app',
        'roads_hour48',
        'SELECT line."referenceId",line.geom, COALESCE("status"."exposed",FALSE) as "exposed" FROM "IBF-app"."lines-data" "line" LEFT JOIN "IBF-app"."lines-data-dynamic-status" "status" ON line."linesDataId" = status."referenceId" WHERE line."linesDataCategory" = \'roads\' AND (status."leadTime" IS NULL OR status."leadTime" = \'48-hour\') ORDER BY "status"."timestamp" DESC',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour48'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour48"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour24'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour24"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour12'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour12"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour11'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour11"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour10'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour10"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour9'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour9"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour8'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour8"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour7'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour7"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour6'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour6"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour5'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour5"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour4'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour4"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour3'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour3"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour2'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour2"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'roads_hour1'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."roads_hour1"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour48'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour48"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour24'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour24"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour12'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour12"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour11'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour11"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour10'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour10"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour9'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour9"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour8'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour8"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour7'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour7"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour6'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour6"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour5'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour5"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour4'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour4"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour3'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour3"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour2'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour2"`);
    await queryRunner.query(
      `DELETE FROM "IBF-app"."typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['IBF-app', 'buildings_hour1'],
    );
    await queryRunner.query(`DROP VIEW "IBF-app"."buildings_hour1"`);
    await queryRunner.query(`DROP TABLE "IBF-app"."typeorm_metadata"`);
  }
}
