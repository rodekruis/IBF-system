import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoundingBox } from '../../../shared/geo.model';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { AdminLevel } from '../admin-level.enum';

export class CountryDto {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: 'UG' })
  public countryCodeISO2: string;

  @ApiProperty({ example: 'Uganda' })
  public countryName: string;

  @ApiProperty()
  public countryDisasterSettings: CountryDisasterSettingsDto[];

  @ApiProperty({
    example: {
      '1': {
        singular: 'Region',
        plural: 'Regions',
      },
      '2': {
        singular: 'District',
        plural: 'Districts',
      },
    },
  })
  public adminRegionLabels: {};

  @ApiProperty({
    example: {
      drought: ['logo1.svg', 'logo2.png'],
      floods: ['logo3.svg', 'logo4.png'],
    },
  })
  public countryLogos: {};

  @ApiProperty({
    example: {
      type: 'Polygon',
      coordinates: [],
    },
  })
  public countryBoundingBox: BoundingBox;

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
  public droughtForecastSeasons?: {};

  @ApiProperty({ example: false })
  public droughtEndOfMonthPipeline?: boolean;

  @ApiProperty({ example: false })
  public showMonthlyEapActions?: boolean;

  @ApiProperty({ example: true })
  public enableStopTrigger?: boolean;

  @ApiProperty({ example: {} })
  public monthlyForecastInfo?: {};

  @ApiProperty({
    example: 'https://docs.google.com',
  })
  public eapLink: string;

  @ApiProperty({
    example: {
      no: {
        label: 'No action',
        color: 'ibf-gray',
        valueLow: 0,
        valueHigh: 0.8,
      },
      max: {
        label: 'Activate EAP',
        color: 'ibf-trigger-alert-primary',
        valueLow: 0.8,
        valueHigh: 1.01,
      },
    },
  })
  public eapAlertClasses?: {};

  @ApiProperty({ example: {} })
  public droughtAreas?: {};
}

export class AddCountriesDto {
  @ApiProperty({
    example: [{}],
  })
  @IsNotEmpty()
  public countries: CountryDto[];
}
