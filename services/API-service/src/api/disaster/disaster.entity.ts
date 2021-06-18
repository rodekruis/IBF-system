import { CountryEntity } from './../country/country.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { DisasterType } from './disaster-type.enum';

@Entity('disaster')
export class DisasterEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public disasterType: DisasterType;

  @Column()
  public label: string;

  @Column({ default: 'population' })
  public triggerUnit: string;

  @Column({ default: 'population_affected' })
  public actionsUnit: string;

  @ManyToMany(
    (): typeof CountryEntity => CountryEntity,
    (countries): DisasterEntity[] => countries.disasterTypes,
  )
  @JoinTable()
  public countries: CountryEntity[];

  @ManyToMany(
    (): typeof LeadTimeEntity => LeadTimeEntity,
    (leadTime): DisasterEntity[] => leadTime.disasterTypes,
  )
  @JoinTable()
  public leadTimes: LeadTimeEntity[];
}
