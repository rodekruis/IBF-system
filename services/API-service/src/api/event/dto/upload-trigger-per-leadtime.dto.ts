import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TriggerPerLeadTimeDto } from './trigger-per-leadtime.dto';
import triggers from './example/triggers-per-leadtime-UGA-triggered.json';

export class UploadTriggerPerLeadTimeDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: triggers })
  @IsArray()
  @ValidateNested()
  @Type(() => TriggerPerLeadTimeDto)
  public triggersPerLeadTime: TriggerPerLeadTimeDto[];
}
