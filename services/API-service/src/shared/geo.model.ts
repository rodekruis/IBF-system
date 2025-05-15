import { Point } from 'typeorm';

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
  public numberOfVolunteers: number;
  public contactPerson: string;
  public contactAddress: string;
  public contactNumber: string;
}

export const point: Point = { type: 'Point', coordinates: [] };

export class BoundingBox {
  public type: string;
  public coordinates: number[][][];
}
