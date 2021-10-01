import { ApiProperty } from '@nestjs/swagger';

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

export class Geometry {
  public type: string;
  public coordinates: number[];
}

export class GeoJsonFeature {
  public type: string;
  public geometry: Geometry;
  public properties: object;
}

export class GeoJson {
  @ApiProperty({ example: 'FeatureCollection' })
  public type: string;
  @ApiProperty({
    example: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [] },
        properties: {},
      },
    ],
  })
  public features: GeoJsonFeature[];
}

export class BoundingBox {
  public type: string;
  public coordinates: number[][][];
}
