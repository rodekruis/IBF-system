import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class UploadStationDto {
  @ApiProperty({ example: 'G1374' })
  @IsNotEmpty()
  @IsString()
  public stationCode: string;

  @ApiProperty({ example: 'name' })
  @IsString()
  public stationName: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
