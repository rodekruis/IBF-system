import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class EvacuationCenterDto {
  @ApiProperty({ example: 'name ' })
  @IsNotEmpty()
  @IsString()
  public evacuationCenterName: string = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
