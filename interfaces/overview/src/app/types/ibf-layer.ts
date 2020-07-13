import { Layer, LayerGroup, Marker } from 'leaflet';
import { IbfLayerType } from './ibf-layer-type';

export class IbfLayer {
  type: IbfLayerType;
  name: string;
  active: boolean;
  data?: GeoJSON.FeatureCollection | GeoJSON.Feature;
  leafletLayer?: Layer | LayerGroup | Marker;
}
