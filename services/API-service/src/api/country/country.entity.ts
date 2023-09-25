import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoundingBox } from '../../shared/geo.model';
import { UserEntity } from '../user/user.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { NotificationInfoEntity } from '../notification/notifcation-info.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CountryDisasterSettingsEntity } from './country-disaster.entity';

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

  @OneToMany(
    () => CountryDisasterSettingsEntity,
    (settings): CountryEntity => settings.country,
  )
  public countryDisasterSettings: CountryDisasterSettingsEntity[];

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
      drought: ['logo1.svg', 'logo2.png'],
      floods: ['logo3.svg', 'logo4.png'],
    },
  })
  @Column('json', {
    default: {},
  })
  public countryLogos: JSON;

  @ApiProperty({
    example: {
      type: 'Polygon',
      coordinates: [],
    },
  })
  @Column('geometry', {
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  public countryBoundingBox: BoundingBox;

  @ApiProperty({ example: new Date() })
  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

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
