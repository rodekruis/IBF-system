import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { AdminLevel } from './admin-level.enum';
import { CountryEntity } from './country.entity';

export interface ForecastSource {
  label: string;
  url?: string;
  setTriggerSource?: string;
}

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
  @ManyToOne((): typeof DisasterTypeEntity => DisasterTypeEntity)
  @JoinColumn({ name: 'disasterType', referencedColumnName: 'disasterType' })
  @Column()
  public disasterType: DisasterType;

  @ApiProperty({ example: [1, 2, 3, 4] })
  @Column('int', { array: true })
  public adminLevels: AdminLevel[];

  @ApiProperty({ example: AdminLevel.adminLevel1 })
  @Column({ default: AdminLevel.adminLevel1 })
  public defaultAdminLevel: AdminLevel;

  @ApiProperty()
  @Column('json', { nullable: true })
  public activeLeadTimes: LeadTime[];

  @ApiProperty({ example: [3, 10] })
  @Column('json', { nullable: true })
  public droughtSeasonRegions: JSON;

  @ApiProperty({ example: false })
  @Column({ default: false })
  public showMonthlyEapActions: boolean;

  @ApiProperty()
  @Column('json', { default: null, nullable: true })
  public forecastSource: ForecastSource;

  @ApiProperty({ example: 'https://docs.google.com' })
  @Column({ default: '' })
  public eapLink: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  public droughtRegions: JSON;

  @ApiProperty()
  @Column({ default: true })
  public enableEarlyActions: boolean;
}
