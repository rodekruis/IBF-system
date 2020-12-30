import {
  IbfLayerLabel,
  IbfLayerName,
  IbfLayerType,
} from 'src/app/types/ibf-layer';

export default {
  type: IbfLayerType.point,
  name: IbfLayerName.adminRegions,
  label: IbfLayerLabel.adminRegions,
  description: 'Mock Description',
  active: true,
  show: true,
  viewCenter: false,
  order: 0,
};
