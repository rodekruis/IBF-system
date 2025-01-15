import { LayerActivation } from 'src/app/models/layer-activation.enum';
import { IbfLayerLabel, IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';

export const MOCK_INDICATOR: Indicator = {
  countryDisasterTypes: JSON,
  name: IbfLayerName.population,
  label: IbfLayerLabel.population,
  icon: '',
  active: LayerActivation.no,
  numberFormatMap: NumberFormat.decimal0,
  numberFormatAggregate: NumberFormat.decimal0,
  weightedAvg: false,
  weightVar: IbfLayerName.population,
  order: 1,
  lazyLoad: false,
  description: JSON.parse(
    JSON.stringify({ KEN: { floods: 'Population affected by floods' } }),
  ),
  aggregateUnit: '',
};
