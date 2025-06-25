import { ApiProperty } from '@nestjs/swagger';

import { FeatureCollection } from 'geojson';

export class AdminAreaUploadDto {
  @ApiProperty({
    description: 'GeoJSON data containing admin area boundaries',
    example: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            ADM2_PCODE: 'UG123',
            ADM2_EN: 'Example District',
            ADM1_PCODE: 'UG1',
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [32.1, 0.5],
                  [32.2, 0.5],
                  [32.2, 0.6],
                  [32.1, 0.5],
                ],
              ],
            ],
          },
        },
      ],
    },
  })
  adminAreaGeoJson: FeatureCollection;
}
