import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';
import { Polygon } from 'geojson';

import { AdminRegionLabels } from '../../../scripts/interfaces/country.interface';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { AdminLevel } from '../admin-level.enum';

export class CountryDto {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: 'Uganda' })
  public countryName: string;

  @ApiProperty()
  public countryDisasterSettings: CountryDisasterSettingsDto[];

  @ApiProperty({
    example: {
      '1': { singular: 'Region', plural: 'Regions' },
      '2': { singular: 'District', plural: 'Districts' },
    },
  })
  public adminRegionLabels: Partial<AdminRegionLabels>;

  @ApiProperty({
    example: {
      drought: ['logo1.svg', 'logo2.png'],
      floods: ['logo3.svg', 'logo4.png'],
    },
  })
  public countryLogos: Partial<Record<DisasterType, string[]>>;

  @ApiProperty({ example: { type: 'Polygon', coordinates: [] } })
  public countryBoundingBox: Polygon;

  @ApiProperty()
  public disasterTypes: string[];
}

export class CountryDisasterSettingsDto {
  @ApiProperty({ example: DisasterType.Floods })
  public disasterType: string;

  @ApiProperty({ example: [1, 2, 3, 4] })
  public adminLevels: AdminLevel[];

  @ApiProperty({ example: AdminLevel.adminLevel1 })
  public defaultAdminLevel: AdminLevel;

  @ApiProperty()
  public activeLeadTimes: string[];

  @ApiProperty({ example: [3, 10] })
  public droughtSeasonRegions?: object;

  @ApiProperty({ example: false })
  public showMonthlyEapActions?: boolean;

  @ApiProperty({ example: true })
  public enableEarlyActions?: boolean;

  @ApiProperty({
    example: { label: 'Global ECMWF', url: 'https://www.ecmwf.int' },
  })
  public forecastSource?: object;

  @ApiProperty({ example: 'https://docs.google.com' })
  public eapLink: string;

  @ApiProperty({
    example: {
      no: { label: 'No action', color: 'ibf-grey', value: 0 },
      max: {
        label: 'Activate EAP',
        color: 'ibf-trigger-alert-primary',
        value: 1,
      },
    },
  })
  public eapAlertClasses?: object;

  @ApiProperty({ example: {} })
  public droughtRegions?: object;
}

export class AddCountriesDto {
  @ApiProperty({ example: [{}] })
  @IsNotEmpty()
  public countries: CountryDto[];
}
