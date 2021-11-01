import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { CountryDisasterSettingsEntity } from '../country/country-disaster.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
@Entity('lead-time')
export class LeadTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public leadTimeId: string;

  @Column({ unique: true })
  public leadTimeName: string;

  @Column()
  public leadTimeLabel: string;

  @ManyToMany(
    (): typeof CountryDisasterSettingsEntity => CountryDisasterSettingsEntity,
    (country): LeadTimeEntity[] => country.activeLeadTimes,
  )
  public countries: CountryDisasterSettingsEntity[];

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;

  @ManyToMany(
    (): typeof DisasterEntity => DisasterEntity,
    (disasterType): LeadTimeEntity[] => disasterType.leadTimes,
  )
  public disasterTypes: DisasterEntity[];
}
