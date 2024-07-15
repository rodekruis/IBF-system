import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

export class BuildingDto {
  @ApiProperty({ example: 1234 })
  public fid: number = undefined;

  @ApiProperty({
    example:
      'MULTIPOLYGON (((33.86621 -11.3379197,33.8663039 -11.3380118,33.8663548 -11.3379645,33.8662556 -11.3378777,33.86621 -11.3379197)))',
  })
  @IsNotEmpty()
  public wkt: number = undefined;
}
