import { IsIn } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';

@Entity('glofasStationTrigger')
export class GlofasStationTriggerEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({ name: 'countryCode', referencedColumnName: 'countryCodeISO3' })
  public countryCodeISO3: string;

  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;

  @Column({ type: 'date' })
  public date: Date;

  @Column()
  public stationCode: string;

  @Column({ type: 'double precision' })
  public forecastLevel: string;

  @Column({ type: 'double precision' })
  public forecastProbability: string;

  @Column()
  @IsIn([0, 1])
  public forecastTrigger: number;

  @Column({ nullable: true })
  public forecastReturnPeriod: number;
}
