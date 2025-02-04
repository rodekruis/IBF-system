import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DisasterType } from '../../disaster-type/disaster-type.enum';
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

  @ApiProperty({ example: AreaOfFocusEnum.DISASTER_RISK_REDUCTION })
  @IsNotEmpty()
  @IsEnum(AreaOfFocusEnum)
  public areaOfFocusId: AreaOfFocusEnum;

  @ApiProperty({ example: 'disaster-risk-reduction-1' })
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty({ example: 'Dummy action' })
  @IsNotEmpty()
  @IsString()
  public label: string;

  @ApiProperty({
    example: null,
    description:
      'Specify an optional calendar month (1-12) in which this action is applicable.',
  })
  @IsOptional()
  public month?: object;
}

export class AddEapActionsDto {
  @ApiProperty({
    example: [
      {
        countryCodeISO3: 'UGA',
        disasterType: DisasterType.Floods,
        action: 'disaster-risk-reduction-1',
        areaOfFocus: AreaOfFocusEnum.DISASTER_RISK_REDUCTION,
        label: 'Dummy action',
        month: null,
      },
    ],
  })
  @IsNotEmpty()
  public eapActions: EapActionDto[];
}
