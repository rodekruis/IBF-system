import { IsArray, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CountryStatus } from '../country-status.enum';
import { AdminLevel } from '../admin-level.enum';
import { LeadTimeEntity } from 'src/api/lead-time/lead-time.entity';

export class CreateCountryDto {
    @ApiProperty({ example: 'UGA' })
    @IsNotEmpty()
    @Length(3, 3)
    public countryCodeISO3: string;

    @ApiProperty({ example: 'UG' })
    @IsNotEmpty()
    @Length(2, 2)
    public countryCodeISO2: string;

    @ApiProperty({ example: 'Uganda' })
    @IsString()
    @IsNotEmpty()
    public countryName: string;

    @ApiProperty({
        example: CountryStatus.Active,
        default: CountryStatus.Inactive,
    })
    @IsEnum(CountryStatus)
    @IsNotEmpty()
    public countryStatus: CountryStatus;

    @ApiProperty({
        example: AdminLevel.adm2,
        default: AdminLevel.adm1,
    })
    @IsEnum(AdminLevel)
    @IsNotEmpty()
    public defaultAdminLevel: AdminLevel;

    @ApiProperty()
    @IsArray()
    public adminRegionLabels: string[];

    @ApiProperty()
    @IsString()
    public eapLink: string;

    @ApiProperty()
    @IsArray()
    @IsEnum(LeadTimeEntity)
    public countryActiveLeadTimes: LeadTimeEntity[];

    @ApiProperty()
    @IsArray()
    public countryLogos: string[];
}
