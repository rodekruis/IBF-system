import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EapActionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['UGA', 'ZMB', 'KEN', 'ETH'])
  public countryCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  public status: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public placeCode: string;
}
