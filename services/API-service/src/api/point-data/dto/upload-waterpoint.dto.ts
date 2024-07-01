import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class WaterpointDto {
  @ApiProperty({ example: 'name' })
  @IsString()
  public name: string = undefined;

  @ApiProperty({ example: 'description' })
  @IsString()
  public description: string = undefined;

  @ApiProperty({ example: 'type' })
  @IsString()
  public type: string = undefined;

  @ApiProperty({ example: '1234' })
  public fid: string = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
