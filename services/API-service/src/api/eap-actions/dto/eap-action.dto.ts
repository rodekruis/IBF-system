import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AreaOfFocusEntity } from '../area-of-focus.entity';

export class AddEapActionsDto {
  @ApiProperty()
  @IsNotEmpty()
  public eapActions: EapActionDto[];
}

class EapActionDto {
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
  public areaOfFocus: AreaOfFocusEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public label: string;

  @ApiProperty()
  @IsNumber()
  public month: number;
}
