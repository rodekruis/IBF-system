import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { Type } from 'class-transformer';
import { VulnerableGroupsDetailsDto } from './vulnerable-groups-details';

export class UploadVulnerableGroupsDto {
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
  @Type(() => VulnerableGroupsDetailsDto)
  public vulnerableGroupsDetails: VulnerableGroupsDetailsDto[];
}
