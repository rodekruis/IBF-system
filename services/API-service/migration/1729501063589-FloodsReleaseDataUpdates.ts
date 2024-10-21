import { MigrationInterface, QueryRunner } from 'typeorm';

export class FloodsReleaseDataUpdates1729501063589
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // NOTE: update countries/notification-info/indicator-metadata/layer-metadata via API-calls on production
    // REFACTOR: in a similar next issue, include this in the migration script

    // update disaster table
    await queryRunner.query(
      `UPDATE "IBF-app".disaster SET "minLeadTime"='0-day' WHERE "disasterType"='floods';`,
    );

    // update lead-time table (if not exists)
    const leadTime0dayExists = await queryRunner.query(
      `SELECT * FROM "IBF-app"."lead-time" WHERE "leadTimeName"='0-day';`,
    );
    if (!leadTime0dayExists) {
      await queryRunner.query(
        `INSERT INTO "IBF-app"."lead-time"
        ("leadTimeId", "leadTimeName", created)
        VALUES(uuid_generate_v4(), '0-day', now());
        `,
      );
    }

    // close open floods events ..
    // .. by 1. setting endDate to now()
    await queryRunner.query(
      `UPDATE "IBF-app"."event-place-code"
            SET "endDate" = now()
            WHERE "disasterType" = 'floods'
            AND "eventName" is null
            AND "adminAreaId" is not null
            AND closed = false;
          `,
    );
    // .. and 2. closing the event
    await queryRunner.query(
      `UPDATE "IBF-app"."event-place-code"
            SET closed = true
            WHERE "disasterType" = 'floods'
            AND "eventName" is null
            AND "adminAreaId" is not null
            AND closed = false;
          `,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
