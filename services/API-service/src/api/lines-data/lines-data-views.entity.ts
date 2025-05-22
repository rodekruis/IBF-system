import { ViewEntity } from 'typeorm';

import { AppDataSource } from '../../../appdatasource';
import { LinesDataCategory, LinesDataEntity } from './lines-data.entity';
import { LinesDataDynamicStatusEntity } from './lines-data-dynamic-status.entity';

const getViewQuery = (type: LinesDataCategory) => {
  return () => {
    const select = [
      'line."referenceId"',
      'line."countryCodeISO3"',
      'line.geom',
    ];
    if (type === LinesDataCategory.roads) {
      select.push('line.attributes->>\'highway\' as "highway"');
    }

    return AppDataSource.createQueryBuilder()
      .select(select)
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
};
@ViewEntity({ expression: getViewQuery(LinesDataCategory.buildings) })
export class BuildingsExposurePerLeadTime {}

@ViewEntity({ expression: getViewQuery(LinesDataCategory.roads) })
export class RoadsExposurePerLeadTime {}
