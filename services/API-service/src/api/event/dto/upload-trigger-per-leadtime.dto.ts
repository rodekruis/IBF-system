import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import triggers from '../../../scripts/mock-data/floods/UGA/trigger/G5075/triggers-per-leadtime.json';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { TriggerPerLeadTimeDto } from './trigger-per-leadtime.dto';

export class UploadTriggerPerLeadTimeDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  @IsString()
  public disasterType: DisasterType;

  @ApiProperty({ example: 'Typhoon name' })
  @IsOptional()
  @IsString()
  public eventName: string;

  @ApiProperty({ example: triggers })
  @IsArray()
  @ValidateNested()
  @Type(() => TriggerPerLeadTimeDto)
  public triggersPerLeadTime: TriggerPerLeadTimeDto[];

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}
