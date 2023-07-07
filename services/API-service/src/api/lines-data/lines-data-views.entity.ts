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
      .leftJoin(
        subquery => {
          return subquery
            .select('MAX(timestamp) as max_timestamp')
            .from(LinesDataEntity, 'line')
            .leftJoin(
              LinesDataDynamicStatusEntity,
              'status',
              'line."linesDataId" = status."referenceId"',
            )
            .where(`line."linesDataCategory" = '${type}'`);
        },
        'max_timestamp',
        '1=1',
      )
      .where(`line."linesDataCategory" = '${type}'`)
      .andWhere(
        '(status.timestamp = max_timestamp.max_timestamp OR status.timestamp IS NULL)',
      )
      .addSelect([
        'status."leadTime"',
        'COALESCE(status.exposed,FALSE) as "exposed"',
      ]);
};
@ViewEntity({
  expression: getViewQuery(LinesDataEnum.buildings),
})
export class BuildingsExposurePerLeadTime {}

@ViewEntity({
  expression: getViewQuery(LinesDataEnum.roads),
})
export class RoadsExposurePerLeadTime {}
