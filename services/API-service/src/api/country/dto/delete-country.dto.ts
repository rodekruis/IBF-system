import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCountryDto {
    @ApiProperty()
    @IsNotEmpty()
    public countryCodeISO3: string;
}
