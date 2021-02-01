import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoundingBox } from '../data/geo.model';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { UserEntity } from '../user/user.entity';
import { AdminLevel } from './admin-level.enum';
import { CountryStatus } from './country-status.enum';

@Entity('country')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public countryCodeISO3: string;

  @Column()
  public countryCodeISO2: string;

  @Column()
  public countryName: string;

  @Column({ default: CountryStatus.Active })
  public countryStatus: CountryStatus;

  @Column({ default: AdminLevel.adm1 })
  public defaultAdminLevel: AdminLevel;

  @Column('text', {
    array: true,
    default: (): string => 'array[]::text[]',
  })
  public adminRegionLabels: string[];

  @Column({ nullable: true })
  public eapLink: string;

  @Column('text', {
    array: true,
    default: (): string => 'array[]::text[]',
  })
  public countryLogos: string[];

  @Column('geometry')
  public countryBoundingBox: BoundingBox;

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @ManyToMany(
    (): typeof LeadTimeEntity => LeadTimeEntity,
    (leadTime): CountryEntity[] => leadTime.countries,
  )
  @JoinTable()
  public countryLeadTimes: LeadTimeEntity[];

  @ManyToMany(
    (): typeof UserEntity => UserEntity,
    (user): CountryEntity[] => user.countries,
  )
  public users: UserEntity[];
}
