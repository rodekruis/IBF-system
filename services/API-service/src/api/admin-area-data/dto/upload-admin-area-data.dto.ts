import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadAdminAreaDataDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public countryCodeISO3: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    public adminLevel: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public placeCode: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public key: number;

    @ApiProperty()
    @IsNumber()
    public value: number;
}
