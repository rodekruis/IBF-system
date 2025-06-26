import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WaterpointDto {
  @ApiProperty({ example: '1234' })
  public fid: string = '';

  @ApiProperty({ example: 'name' })
  @IsString()
  @IsOptional()
  public name: string = '';

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;

  @ApiProperty({ example: 'type' })
  @IsString()
  @IsOptional()
  public type: string = '';

  @ApiProperty({ example: '2025-06-23' })
  @IsString()
  @IsOptional()
  public report_date: string = '';
}
