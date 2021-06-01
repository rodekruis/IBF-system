import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { DynamicIndicator } from './enum/dynamic-indicator';

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

  @Column()
  public adminLevel: number;

  @Column()
  public placeCode: string;

  @Column()
  public indicator: DynamicIndicator;

  @Column({ type: 'date' })
  public date: Date;

  @Column({ nullable: true, type: 'real' })
  public value: number;

  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;
}
