import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

import {
  LeadTime,
  LeadTimeUnit,
} from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../disaster-type.enum';

export class DisasterTypeDto {
  @ApiProperty({ example: 'DisasterType.Floods' })
  public disasterType: DisasterType;

  @ApiProperty({ example: 'flood' })
  public label: string;

  @ApiProperty({
    example: 'population_affected',
    description: `List the 'indicator' here that is used as main exposure indicator.`,
  })
  public mainExposureIndicator: string;

  @ApiProperty({ default: false })
  public showOnlyTriggeredAreas: boolean;

  @ApiProperty({ example: LeadTimeUnit.day })
  public leadTimeUnit: LeadTimeUnit;

  @ApiProperty({ example: LeadTime.day0 })
  public minLeadTime: LeadTime;

  @ApiProperty({ example: LeadTime.day7 })
  public maxLeadTime: LeadTime;
}

export class AddDisasterTypesDto {
  @ApiProperty({
    example: [{}],
  })
  @IsNotEmpty()
  public disasterTypes: DisasterTypeDto[];
}
