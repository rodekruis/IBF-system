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

import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { TrackpointDetailsDto } from './trackpoint-details';

export class UploadTyphoonTrackDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: LeadTime.hour72 })
  @IsNotEmpty()
  @IsString()
  @IsEnum(LeadTime)
  public leadTime: LeadTime;

  @ApiProperty({ example: 'Typhoon name' })
  @IsString()
  public eventName: string;

  @ApiProperty({ example: [] })
  @IsArray()
  @ValidateNested()
  @Type(() => TrackpointDetailsDto)
  public trackpointDetails: TrackpointDetailsDto[];

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public readonly date: Date;
}
