import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GlofasStationDto {
  @ApiProperty({ example: 'G5100' })
  @IsString()
  public stationCode: string = undefined;

  @ApiProperty({ example: 'Station name' })
  @IsOptional()
  public stationName: string = undefined;

  @ApiProperty({ example: 'G5100' })
  @IsOptional()
  public fid: string = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
