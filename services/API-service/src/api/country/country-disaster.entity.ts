import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { AdminLevel } from './admin-level.enum';
import { CountryEntity } from './country.entity';

@Entity('country-disaster-settings')
export class CountryDisasterSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  public countryDisasterSettingsId: string;

  @ManyToOne(
    (): typeof CountryEntity => CountryEntity,
    (country): CountryDisasterSettingsEntity[] =>
      country.countryDisasterSettings,
  )
  public country: CountryEntity;

  @ApiProperty({ example: DisasterType.Floods })
  @ManyToOne((): typeof DisasterEntity => DisasterEntity)
  @JoinColumn({
    name: 'disasterType',
    referencedColumnName: 'disasterType',
  })
  @Column()
  public disasterType: DisasterType;

  @ApiProperty({ example: [1, 2, 3, 4] })
  @Column('int', {
    array: true,
  })
  public adminLevels: AdminLevel[];

  @ApiProperty({ example: AdminLevel.adminLevel1 })
  @Column({ default: AdminLevel.adminLevel1 })
  public defaultAdminLevel: AdminLevel;

  @ApiProperty()
  @ManyToMany(
    (): typeof LeadTimeEntity => LeadTimeEntity,
    (leadTime): CountryDisasterSettingsEntity[] => leadTime.countries,
  )
  @JoinTable()
  public activeLeadTimes: LeadTimeEntity[];

  @ApiProperty({ example: [3, 10] })
  @Column('json', { nullable: true })
  public droughtSeasonRegions: JSON;

  @ApiProperty({ example: false })
  @Column({ default: false })
  public droughtEndOfMonthPipeline: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  public showMonthlyEapActions: boolean;

  @ApiProperty()
  @Column('json', { default: null, nullable: true })
  public monthlyForecastInfo: JSON;

  @ApiProperty({
    example: 'https://docs.google.com',
  })
  @Column({ default: '' })
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
  @Column('json', { nullable: true })
  public eapAlertClasses: JSON;

  @ApiProperty()
  @Column('json', { nullable: true })
  public droughtRegions: JSON;

  @ApiProperty()
  @Column({ default: true })
  public enableEarlyActions: boolean;

  @ApiProperty()
  @Column({ default: true })
  public enableStopTrigger: boolean;

  @ApiProperty()
  @Column({ default: false })
  public isEventBased: boolean;
}
