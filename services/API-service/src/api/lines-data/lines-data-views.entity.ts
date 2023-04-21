import { ViewEntity, getConnection } from 'typeorm';
import { LinesDataEntity, LinesDataEnum } from './lines-data.entity';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.buildings}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour1}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class BuildingsHour1 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.buildings}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour2}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class BuildingsHour2 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.buildings}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour3}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class BuildingsHour3 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.buildings}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour4}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class BuildingsHour4 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.buildings}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour5}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class BuildingsHour5 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.buildings}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour6}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class BuildingsHour6 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.roads}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour1}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class RoadsHour1 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.roads}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour2}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class RoadsHour2 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.roads}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour3}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class RoadsHour3 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.roads}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour4}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class RoadsHour4 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.roads}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour5}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class RoadsHour5 {}

@ViewEntity({
  expression: () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${LinesDataEnum.roads}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${LeadTime.hour6}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC'),
})
export class RoadsHour6 {}
