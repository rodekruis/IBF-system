import { UserEntity } from '../user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { AdminLevel } from './admin-level.enum';
import { ForecastEntity } from '../forecast/forecast.entity';
import { CountryStatus } from './country-status.enum';

@Entity('country')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public countryCode: string;

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

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @ManyToMany(
    (): typeof ForecastEntity => ForecastEntity,
    (forecast): CountryEntity[] => forecast.countries,
  )
  @JoinTable()
  public countryForecasts: ForecastEntity[];

  @ManyToMany(
    (): typeof UserEntity => UserEntity,
    (user): CountryEntity[] => user.countries,
  )
  public users: UserEntity[];
}
