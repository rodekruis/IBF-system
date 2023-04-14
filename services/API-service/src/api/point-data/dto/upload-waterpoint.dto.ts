import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WaterpointDto {
  @ApiProperty({ example: 'name' })
  @IsString()
  public name: string = undefined;

  @ApiProperty({ example: 'type' })
  @IsString()
  public type: string = undefined;

  @ApiProperty({ example: 1234 })
  public fid: number = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
