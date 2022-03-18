import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckEapActionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public disasterType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  public status: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public placeCode: string;

  @ApiProperty()
  @IsString()
  public eventName: string;
}
