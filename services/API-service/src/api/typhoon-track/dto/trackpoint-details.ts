import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackpointDetailsDto {
  @ApiProperty({ example: 90.0 })
  @IsNotEmpty()
  @IsString()
  public lat: string;

  @ApiProperty({ example: 90.0 })
  @IsNotEmpty()
  @IsString()
  public lon: string;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsNumber()
  public timestampOfTrackpoint: Date;
}
