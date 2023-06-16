import { ViewEntity, getConnection } from 'typeorm';
import { LinesDataEntity, LinesDataEnum } from './lines-data.entity';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';

const getViewQuery = (type: LinesDataEnum) => {
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
      .addSelect([
        'status."leadTime"',
        'COALESCE(status.exposed,FALSE) as "exposed"',
      ])
      .orderBy('status.timestamp', 'DESC');
};
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings),
})
export class BuildingsExposurePerLeadTime {}

@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads),
})
export class RoadsExposurePerLeadTime {}
