import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';

// NOTE: this entity is filled directly via /triggers-per-leadtime endpoint for floods only (for all lead times), while for other disaster-types only event starting lead times are filled indirectly as part of /exposure endpoint
// REFACTOR: to either use this for all disaster types or to remove this exception for floods
@Entity('alert-per-lead-time')
export class AlertPerLeadTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'date' })
  public date: Date;

  @Column({ type: 'timestamp', nullable: true })
  public timestamp: Date;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ManyToOne((): typeof DisasterTypeEntity => DisasterTypeEntity)
  @JoinColumn({
    name: 'disasterType',
    referencedColumnName: 'disasterType',
  })
  public disasterType: string;

  @Column()
  public leadTime: LeadTime;

  @Column({ nullable: true })
  public eventName: string;

  @Column({ default: false })
  public forecastAlert: boolean; // true indicates a trigger or warning for this lead time, false indicates neither

  @Column({ default: true })
  public forecastTrigger: boolean; // true indicates a trigger for this lead time, false indicates either a warning or no event
}
