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

@Entity('country')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  public countryId: string;

  @Column({ unique: true })
  public countryCodeISO3: string;

  @Column({ unique: true })
  public countryCodeISO2: string;

  @Column({ unique: true })
  public countryName: string;

  @Column({ default: CountryStatus.Active })
  public countryStatus: CountryStatus;

  @Column('int', {
    array: true,
    default: (): string => 'array[]::int[]',
  })
  public adminLevels: AdminLevel[];

  @Column({ default: AdminLevel.adminLevel1 })
  public defaultAdminLevel: AdminLevel;

  @Column('json', {
    default: {},
  })
  public adminRegionLabels: JSON;

  @Column('json', { default: {} })
  public eapLinks: JSON;

  @Column('json', { nullable: true })
  public eapAlertClasses: JSON;

  @Column('text', {
    array: true,
    default: (): string => 'array[]::text[]',
  })
  public countryLogos: string[];

  @Column('geometry')
  public countryBoundingBox: BoundingBox;

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @Column('json', { nullable: true })
  public glofasStationInput: JSON;

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
