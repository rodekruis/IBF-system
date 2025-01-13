import { AreaStatus } from 'src/app/services/aggregates.service';
import { IbfLayerName } from 'src/app/types/ibf-layer';

export class AggregateRecord {
  placeCode: string;
  placeCodeParent: string;
  indicator: IbfLayerName;
  value: number;
}

export class AggregateByPlaceCode {
  placeCode: string;
  placeCodeParent: string;
  records: AggregateRecord[];
}

export class Aggregate {
  placeCode: string;
  placeCodeParent: string;
  areaStatus?: AreaStatus;
  [key: string]: number | string;
}
