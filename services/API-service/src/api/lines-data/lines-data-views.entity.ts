import { ViewEntity, getConnection } from 'typeorm';
import { LinesDataEntity, LinesDataEnum } from './lines-data.entity';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';

const getViewQuery = (type: LinesDataEnum, leadTime: LeadTime) => {
  return () =>
    getConnection()
      .createQueryBuilder()
      .select(['line."referenceId",line.geom'])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .where(`line."linesDataCategory" = '${type}'`)
      .andWhere(
        `(status."leadTime" IS NULL OR status."leadTime" = '${leadTime}')`,
      )
      .addSelect('COALESCE(status.exposed,FALSE) as "exposed"')
      .orderBy('status.timestamp', 'DESC');
};

@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour1),
})
export class BuildingsHour1 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour2),
})
export class BuildingsHour2 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour3),
})
export class BuildingsHour3 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour4),
})
export class BuildingsHour4 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour5),
})
export class BuildingsHour5 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour6),
})
export class BuildingsHour6 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour7),
})
export class BuildingsHour7 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour8),
})
export class BuildingsHour8 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour9),
})
export class BuildingsHour9 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour10),
})
export class BuildingsHour10 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour11),
})
export class BuildingsHour11 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour12),
})
export class BuildingsHour12 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour24),
})
export class BuildingsHour24 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings, LeadTime.hour48),
})
export class BuildingsHour48 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour1),
})
export class RoadsHour1 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour2),
})
export class RoadsHour2 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour3),
})
export class RoadsHour3 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour4),
})
export class RoadsHour4 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour5),
})
export class RoadsHour5 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour6),
})
export class RoadsHour6 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour7),
})
export class RoadsHour7 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour8),
})
export class RoadsHour8 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour9),
})
export class RoadsHour9 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour10),
})
export class RoadsHour10 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour11),
})
export class RoadsHour11 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour12),
})
export class RoadsHour12 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour24),
})
export class RoadsHour24 {}
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads, LeadTime.hour68),
})
export class RoadsHour48 {}
