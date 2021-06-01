import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryEntity } from '../country/country.entity';

@Entity('trigger-per-lead-time')
export class TriggerPerLeadTime {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'date' })
  public date: Date;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @Column()
  public leadTime: LeadTime;

  @Column({ default: false })
  public triggered: boolean;
}
