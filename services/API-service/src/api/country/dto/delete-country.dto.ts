import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteCountryDto {
  @ApiModelProperty()
  @IsNotEmpty()
  public countryCodeISO3: string;
}
