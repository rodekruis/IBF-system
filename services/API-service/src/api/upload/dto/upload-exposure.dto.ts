import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ExposurePlaceCodeDto } from './exposure-place-code.dto';
import exposure from './example/upload-exposure-example.json';
import { LeadTime } from '../enum/lead-time.enum';

export class UploadExposureDto {
    @ApiProperty({ example: 'PHL' })
    @IsNotEmpty()
    @IsString()
    public countryCodeISO3: string;

    @ApiProperty({ example: exposure })
    @IsArray()
    @ValidateNested()
    @Type(() => ExposurePlaceCodeDto)
    public exposurePlaceCodes: ExposurePlaceCodeDto[];

    @ApiProperty({ example: '1-month' })
    @IsNotEmpty()
    @IsString()
    public leadTime: LeadTime;

    @ApiProperty({ example: 'population' })
    @IsNotEmpty()
    @IsString()
    public exposureUnit: string;
}
