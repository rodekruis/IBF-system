import { CRS } from 'leaflet';

export class IbfLayerWMS {
  url: string;
  name: string;
  format: string;
  version: string;
  attribution: string;
  crs?: CRS;
  transparent: boolean;
}
