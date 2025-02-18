import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DynamicIndicator } from './enum/dynamic-indicator.enum';
import { LeadTime } from './enum/lead-time.enum';

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

  @ManyToOne((): typeof DisasterTypeEntity => DisasterTypeEntity)
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

  @Column({ nullable: true })
  public leadTime: LeadTime;
}
