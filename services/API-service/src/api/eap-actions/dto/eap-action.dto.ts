import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
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
  public pcode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  public event: number;
}
