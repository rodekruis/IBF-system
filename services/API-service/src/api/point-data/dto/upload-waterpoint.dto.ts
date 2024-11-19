import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WaterpointDto {
  @ApiProperty({ example: 'name' })
  @IsString()
  @IsOptional()
  public name: string = undefined;

  @ApiProperty({ example: 'description' })
  @IsString()
  @IsOptional()
  public description: string = undefined;

  @ApiProperty({ example: 'type' })
  @IsString()
  @IsOptional()
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
