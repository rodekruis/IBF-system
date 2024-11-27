import { ViewEntity } from 'typeorm';

import { AppDataSource } from '../../../appdatasource';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';
import { LinesDataEntity, LinesDataEnum } from './lines-data.entity';

const getViewQuery = (type: LinesDataEnum) => {
  return () =>
    AppDataSource.createQueryBuilder()
      .select([
        `line."referenceId",line.geom${
          type === LinesDataEnum.roads
            ? `,line.attributes->>'highway' as "highway"`
            : ''
        }`,
      ])
      .from(LinesDataEntity, 'line')
      .leftJoin(
        LinesDataDynamicStatusEntity,
        'status',
        'line."linesDataId" = status."referenceId"',
      )
      .leftJoin(
        (subquery) => {
          return subquery
            .select([
              'status."leadTime" as "leadTime"',
              'MAX(timestamp) as max_timestamp',
            ])
            .from(LinesDataDynamicStatusEntity, 'status')
            .leftJoin(
              LinesDataEntity,
              'line',
              'line."linesDataId" = status."referenceId"',
            )
            .where(`line."linesDataCategory" = '${type}'`)
            .groupBy('status."leadTime"');
        },
        'max_timestamp',
        'status."leadTime" = max_timestamp."leadTime"',
      )
      .where(`line."linesDataCategory" = '${type}'`)
      .andWhere('line.active = true')
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
