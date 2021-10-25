import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../country/country.entity';
import { DisasterEntity } from '../disaster/disaster.entity';

@Entity('trigger-per-lead-time')
export class TriggerPerLeadTime {
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

  @ManyToOne((): typeof DisasterEntity => DisasterEntity)
  @JoinColumn({
    name: 'disasterType',
    referencedColumnName: 'disasterType',
  })
  public disasterType: string;

  @Column()
  public leadTime: LeadTime;

  @Column({ default: false })
  public triggered: boolean;
}
