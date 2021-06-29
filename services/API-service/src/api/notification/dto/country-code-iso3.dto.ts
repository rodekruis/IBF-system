import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CountryCodeISO3Dto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;
}
