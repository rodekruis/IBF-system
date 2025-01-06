import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

import { BoundingBox } from '../../../shared/geo.model';
import { DisasterType } from '../../disaster/disaster-type.enum';
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
  public adminRegionLabels: object;

  @ApiProperty({
    example: {
      drought: ['logo1.svg', 'logo2.png'],
      floods: ['logo3.svg', 'logo4.png'],
    },
  })
  public countryLogos: object;

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
  public droughtForecastSeasons?: object;

  @ApiProperty({ example: false })
  public droughtEndOfMonthPipeline?: boolean;

  @ApiProperty({ example: false })
  public showMonthlyEapActions?: boolean;

  @ApiProperty({ example: true })
  public enableEarlyActions?: boolean;

  @ApiProperty({ example: true })
  public enableStopTrigger?: boolean;

  @ApiProperty({ example: {} })
  public monthlyForecastInfo?: object;

  @ApiProperty({
    example: 'https://docs.google.com',
  })
  public eapLink: string;

  @ApiProperty({
    example: {
      no: {
        label: 'No action',
        color: 'ibf-gray',
        value: 0,
      },
      max: {
        label: 'Activate EAP',
        color: 'ibf-trigger-alert-primary',
        value: 1,
      },
    },
  })
  public eapAlertClasses?: object;

  @ApiProperty({ example: {} })
  public droughtAreas?: object;

  @ApiProperty({ example: false })
  public isEventBased?: boolean;
}

export class AddCountriesDto {
  @ApiProperty({
    example: [{}],
  })
  @IsNotEmpty()
  public countries: CountryDto[];
}
