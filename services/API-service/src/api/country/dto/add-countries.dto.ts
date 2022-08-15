import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OneToMany, Column, ManyToMany, OneToOne, JoinColumn } from 'typeorm';
import { BoundingBox } from '../../../shared/geo.model';
import { NotificationInfoEntity } from '../../notification/notifcation-info.entity';
import { UserEntity } from '../../user/user.entity';
import { CountryDisasterSettingsEntity } from '../country-disaster.entity';
import { CountryEntity } from '../country.entity';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { AdminLevel } from '../admin-level.enum';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class CountryDto {
  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ example: 'UG' })
  public countryCodeISO2: string;

  @ApiProperty({ example: 'Uganda' })
  public countryName: string;

  @OneToMany(
    () => CountryDisasterSettingsEntity,
    (settings): CountryEntity => settings.country,
  )
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
  public adminRegionLabels: JSON;

  @ApiProperty({
    example: ['logo1.svg', 'logo2.png'],
  })
  public countryLogos: string[];

  @ApiProperty({
    example: {
      type: 'Polygon',
      coordinates: [],
    },
  })
  public countryBoundingBox: BoundingBox;

  @ApiProperty({ example: new Date() })
  public created: Date;

  @ManyToMany(
    (): typeof UserEntity => UserEntity,
    (user): CountryEntity[] => user.countries,
  )
  public users: UserEntity[];

  @ApiProperty()
  public disasterTypes: DisasterType[];

  @OneToOne(() => NotificationInfoEntity, {
    cascade: true,
  })
  @JoinColumn()
  public notificationInfo: NotificationInfoEntity;
}

export class CountryDisasterSettingsDto {
  @ApiProperty({ example: DisasterType.Floods })
  public disasterType: DisasterType;

  @ApiProperty({ example: [1, 2, 3, 4] })
  public adminLevels: AdminLevel[];

  @ApiProperty({ example: AdminLevel.adminLevel1 })
  public defaultAdminLevel: AdminLevel;

  @ApiProperty()
  public activeLeadTimes: LeadTime[];

  @ApiProperty({ example: [3, 10] })
  public droughtForecastSeasons: JSON;

  @ApiProperty({ example: false })
  public droughtEndOfMonthPipeline: boolean;

  @ApiProperty({ example: false })
  public showMonthlyEapActions: boolean;

  @ApiProperty({ example: {} })
  public monthlyForecastInfo: JSON;

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
  public eapAlertClasses: JSON;

  @ApiProperty({ example: {} })
  public droughtAreas: JSON;
}

export class AddCountriesDto {
  @ApiProperty({
    example: [
      {
        countryCodeISO3: 'UGA',
        disasterType: 'floods',
        action: 'drr-1',
        areaOfFocus: { id: 'drr' },
        label: 'DRR dummy action',
        month: null,
      },
    ],
  })
  @IsNotEmpty()
  public countries: CountryDto[];
}
