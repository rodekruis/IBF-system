import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { DynamicIndicator } from './enum/dynamic-data-unit';

@Entity('admin-area-dynamic-data')
export class AdminAreaDynamicDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public adminAreaDynamicDataId: string;

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
  public adminLevel: number;

  @Column({ nullable: true })
  public eventName: string;

  @Index()
  @Column()
  public placeCode: string;

  @Column()
  public indicator: DynamicIndicator;

  @Column({ type: 'date' })
  public date: Date;

  @Column({ type: 'timestamp', nullable: true })
  public timestamp: Date;

  @Column({ nullable: true, type: 'real' })
  public value: number;

  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;
}
