import { IbfLayerLabel, IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';

export default {
  type: IbfLayerType.point,
  name: IbfLayerName.adminRegions,
  label: IbfLayerLabel.adminRegions,
  description: 'Mock Description',
  active: true,
  viewCenter: false,
};
