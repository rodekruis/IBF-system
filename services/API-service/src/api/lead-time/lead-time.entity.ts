import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { leadTimeStatus } from './lead-time-status.enum';

@Entity('lead-time')
export class LeadTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public leadTimeName: string;

  @Column()
  public leadTimeLabel: string;

  @Column()
  public leadTimeStatus: leadTimeStatus;

  @ManyToMany(
    (): typeof CountryEntity => CountryEntity,
    (country): LeadTimeEntity[] => country.countryLeadTimes,
  )
  public countries: CountryEntity[];

  @Column({ type: 'timestamp', default: (): string => 'CURRENT_TIMESTAMP' })
  public created: Date;
}
