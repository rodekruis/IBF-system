import { Layer, LayerGroup, Marker } from 'leaflet';
import { IbfLayerLabel, IbfLayerName } from './ibf-layer-name';
import { IbfLayerType } from './ibf-layer-type';
import { IbfLayerWMS } from './ibf-layer-wms';

export class IbfLayer {
  type: IbfLayerType;
  name: IbfLayerName;
  label: IbfLayerLabel;
  description: string;
  active: boolean;
  viewCenter: boolean;
  colorProperty?: string;
  wms?: IbfLayerWMS;
  data?: GeoJSON.FeatureCollection;
  leafletLayer?: Layer | LayerGroup | Marker;
  legendColor?: string;
}
