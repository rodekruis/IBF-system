import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SchoolDto {
  @ApiProperty({ example: 'name' })
  @IsString()
  @IsOptional()
  public name: string = undefined;

  @ApiProperty({ example: 'amenity' })
  @IsString()
  @IsOptional()
  public amenity: string = undefined;

  @ApiProperty({ example: '1234' })
  public fid: string = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
