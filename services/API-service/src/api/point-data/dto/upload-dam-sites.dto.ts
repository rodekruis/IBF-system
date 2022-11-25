import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DamSiteDto {
  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  @IsString()
  public damName: string = undefined;

  @ApiProperty({ example: 0 })
  public fullSupplyCapacity: number = undefined;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}
