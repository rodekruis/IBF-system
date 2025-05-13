import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class RoadDto {
  @ApiProperty({ example: 'highway' })
  @IsString()
  public highway: string = undefined;

  @ApiProperty({ example: 1234 })
  public fid: number = undefined;

  @ApiProperty({
    example:
      'MULTILINESTRING ((33.5894537 -10.8357481,33.5899016 -10.8354701))',
  })
  @IsNotEmpty()
  public wkt: number = undefined;
}
