import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HealthSiteDto {
  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  @IsString()
  public name: string = undefined;

  @ApiProperty({ example: 'hospital' })
  @IsNotEmpty()
  @IsString()
  public type: string = undefined;

  @ApiProperty({ example: '1234' })
  @IsOptional()
  public fid: string = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
