/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export class Poi {
  code: string;
  name: string;
  geom: string;
}

export class GlofasStation extends Poi {
  triggerLevel: number;
  forecastLevel: number;
  triggerInd: number;
  triggerPerc: number;
  triggerProb: number;
}

export class RedCrossBranch extends Poi {
  nr_volunteers: number;
  contact_person: string;
  contact_address: string;
  contact_number: string;
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
