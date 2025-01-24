import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DisasterType } from '../../disaster/disaster-type.enum';
import { AreaOfFocusEnum } from './area-of-focus.dto';

export class EapActionDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  @IsNotEmpty()
  @IsString()
  public disasterType: string;

  @ApiProperty({ example: AreaOfFocusEnum.DRR })
  @IsNotEmpty()
  @IsEnum(AreaOfFocusEnum)
  public areaOfFocusId: AreaOfFocusEnum;

  @ApiProperty({ example: 'drr-1' })
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty({ example: 'DRR dummy action' })
  @IsNotEmpty()
  @IsString()
  public label: string;

  @ApiProperty({ example: null })
  @IsOptional()
  public month?: object;
}

export class AddEapActionsDto {
  @ApiProperty({
    example: [
      {
        countryCodeISO3: 'UGA',
        disasterType: DisasterType.Floods,
        action: 'drr-1',
        areaOfFocus: AreaOfFocusEnum.DRR,
        label: 'DRR dummy action',
        month: null,
      },
    ],
  })
  @IsNotEmpty()
  public eapActions: EapActionDto[];
}
