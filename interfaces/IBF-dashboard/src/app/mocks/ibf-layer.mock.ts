import {
  IbfLayerGroup,
  IbfLayerLabel,
  IbfLayerName,
  IbfLayerType,
} from 'src/app/types/ibf-layer';

export default {
  type: IbfLayerType.point,
  name: IbfLayerName.adminRegions2,
  group: IbfLayerGroup.adminRegions,
  label: IbfLayerLabel.adminRegions2,
  description: 'Mock Description',
  active: true,
  show: true,
  viewCenter: false,
  order: 0,
};
