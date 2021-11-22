import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackpointDetailsDto {
  @ApiProperty({ example: 90.0 })
  @IsNotEmpty()
  @IsNumber()
  public lat: string;

  @ApiProperty({ example: 90.0 })
  @IsNotEmpty()
  @IsNumber()
  public lon: string;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsString()
  public timestampOfTrackpoint: Date;
}
