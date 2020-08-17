import { Layer, LayerGroup, Marker } from 'leaflet';
import { IbfLayerType } from './ibf-layer-type';
import { IbfLayerWMS } from './ibf-layer-wms';

export class IbfLayer {
  type: IbfLayerType;
  name: string;
  active: boolean;
  viewCenter: boolean;
  wms?: IbfLayerWMS;
  data?: GeoJSON.FeatureCollection | GeoJSON.Feature;
  leafletLayer?: Layer | LayerGroup | Marker;
}
