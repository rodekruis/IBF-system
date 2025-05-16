import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HealthSiteDto {
  @ApiProperty({ example: 'name' })
  @IsOptional()
  @IsString()
  public name: string = undefined;

  @ApiProperty({ example: 'hospital' })
  @IsOptional()
  @IsString()
  public type: string = undefined;

  @ApiProperty({ example: '1234' })
  @IsOptional() // Optional because only present for countries where dynamic exposure data on these assets is uploaded
  public fid: string = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
