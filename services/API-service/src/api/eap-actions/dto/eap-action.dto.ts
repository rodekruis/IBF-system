import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { DisasterType } from '../../disaster/disaster-type.enum';
import { AreaOfFocusEntity } from '../area-of-focus.entity';

class EapActionDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  @IsNotEmpty()
  @IsString()
  public disasterType: string;

  @ApiProperty({ example: JSON.parse(JSON.stringify({ id: 'drr' })) })
  @IsNotEmpty()
  public areaOfFocus: AreaOfFocusEntity;

  @ApiProperty({ example: 'drr-1' })
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiProperty({ example: 'DRR dummy action' })
  @IsNotEmpty()
  @IsString()
  public label: string;

  @ApiProperty({ example: null })
  public month: JSON;
}

export class AddEapActionsDto {
  @ApiProperty({
    example: [
      {
        countryCodeISO3: 'UGA',
        disasterType: DisasterType.Floods,
        action: 'drr-1',
        areaOfFocus: { id: 'drr' },
        label: 'DRR dummy action',
        month: null,
      },
    ],
  })
  @IsNotEmpty()
  public eapActions: EapActionDto[];
}
