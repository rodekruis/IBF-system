/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export class Poi {
  code: string;
  name: string;
  geom: string;
}

export class Station extends Poi {
  triggerLevel: number;
  forecastLevel: number;
  triggerInd: number;
  triggerPerc: number;
  triggerProb: number;
}

export class GeoJson {
  type: string;
  features: GeoJsonFeature[];
}

export class GeoJsonFeature {
  type: string;
  geometry: Geometry;
  properties: any;
}

export class Geometry {
  type: string;
  coordinates: number[];
}
