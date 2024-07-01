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

import { DisasterType } from '../../disaster/disaster-type.enum';
import triggers from './example/triggers-per-leadtime-UGA-triggered.json';
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
