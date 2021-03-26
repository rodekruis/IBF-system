export class Poi {
  public code: string;
  public name: string;
  public geom: string;
}

export class GlofasStation extends Poi {
  public triggerLevel: number;
  public forecastLevel: number;
  public triggerInd: number;
  public triggerPerc: number;
  public triggerProb: number;
}

export class RedCrossBranch extends Poi {
  public nrVolunteers: number;
  public contactPerson: string;
  public contactAddress: string;
  public contactNumber: string;
}

export class GeoJson {
  public type: string;
  public features: GeoJsonFeature[];
}

export class GeoJsonFeature {
  public type: string;
  public geometry: Geometry;
  public properties: object;
}

export class Geometry {
  public type: string;
  public coordinates: number[];
}

export class BoundingBox {
  public type: string;
  public coordinates: number[][][];
}
