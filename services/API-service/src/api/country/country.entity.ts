import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoundingBox } from '../../shared/geo.model';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { UserEntity } from '../user/user.entity';
import { AdminLevel } from './admin-level.enum';
import { CountryStatus } from './country-status.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { NotificationInfoEntity } from '../notification/notifcation-info.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('country')
export class CountryEntity {
  @ApiProperty({ example: '6b9b7669-4839-4fdb-9645-9070a27bda86' })
  @PrimaryGeneratedColumn('uuid')
  public countryId: string;

  @ApiProperty({ example: 'UGA' })
  @Column({ unique: true })
  public countryCodeISO3: string;

  @ApiProperty({ example: 'UG' })
  @Column({ unique: true })
  public countryCodeISO2: string;

  @ApiProperty({ example: 'Uganda' })
  @Column({ unique: true })
  public countryName: string;

  @ApiProperty({ example: true })
  @Column({ default: CountryStatus.Active })
  public countryStatus: CountryStatus;

  @ApiProperty({
    example: { floods: { adminLevels: [3], defaultAdminLevel: 3 } },
  })
  @Column('json', { default: {} })
  public disasterTypeSettings: JSON;

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
  @Column('json', {
    default: {},
  })
  public adminRegionLabels: JSON;

  @ApiProperty({
    example: {
      floods: 'https://docs.google.com',
    },
  })
  @Column('json', {
    default: {},
  })
  public eapLinks: JSON;

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

  @ApiProperty({
    example: ['logo1.svg', 'logo2.png'],
  })
  @Column('text', {
    array: true,
    default: (): string => 'array[]::text[]',
  })
  public countryLogos: string[];

  @ApiProperty({
    example: {
      type: 'Polygon',
      coordinates: [],
    },
  })
  @Column('geometry')
  public countryBoundingBox: BoundingBox;

  @ApiProperty({ example: new Date() })
  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @ApiProperty({ example: new Date() })
  @Column('json', { nullable: true })
  public glofasStationInput: JSON;

  @ApiProperty()
  @ManyToMany(
    (): typeof LeadTimeEntity => LeadTimeEntity,
    (leadTime): CountryEntity[] => leadTime.countries,
  )
  @JoinTable()
  public countryActiveLeadTimes: LeadTimeEntity[];

  @ManyToMany(
    (): typeof UserEntity => UserEntity,
    (user): CountryEntity[] => user.countries,
  )
  public users: UserEntity[];

  @ApiProperty()
  @ManyToMany(
    (): typeof DisasterEntity => DisasterEntity,
    (disasterType): CountryEntity[] => disasterType.countries,
  )
  public disasterTypes: DisasterEntity[];

  @OneToOne(() => NotificationInfoEntity, {
    cascade: true,
  })
  @JoinColumn()
  public notificationInfo: NotificationInfoEntity;
}
