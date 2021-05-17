import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EapActionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
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
