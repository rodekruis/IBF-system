import {
  IbfLayer,
  IbfLayerLabel,
  IbfLayerName,
  IbfLayerType,
} from 'src/app/types/ibf-layer';

export const MOCK_LAYERS: IbfLayer[] = [
  {
    type: IbfLayerType.point,
    name: IbfLayerName.waterpoints,
    label: IbfLayerLabel.waterpoints,
    description: 'waterpoints',
    active: true,
    show: true,
    viewCenter: false,
    order: 1,
  },
  {
    type: IbfLayerType.point,
    name: IbfLayerName.redCrossBranches,
    label: IbfLayerLabel.redCrossBranches,
    description: 'redCrossBranches',
    active: true,
    show: true,
    viewCenter: false,
    order: 2,
  },
];
