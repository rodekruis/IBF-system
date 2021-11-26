import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { Type } from 'class-transformer';
import { TrackpointDetailsDto } from './trackpoint-details';

export class UploadTyphoonTrackDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: LeadTime.hour72 })
  @IsNotEmpty()
  @IsString()
  public leadTime: LeadTime;

  @ApiProperty({ example: 'Typhoon name' })
  @IsString()
  public eventName: string;

  @ApiProperty({ example: [] })
  @IsArray()
  @ValidateNested()
  @Type(() => TrackpointDetailsDto)
  public trackpointDetails: TrackpointDetailsDto[];
}
