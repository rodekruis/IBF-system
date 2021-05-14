import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { ExposureUnit } from './enum/exposure-unit';

@Entity('admin_area_dynamic_data')
export class AdminAreaDynamicDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public adminAreaDynamicDataId: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({ name: 'countryCode', referencedColumnName: 'countryCodeISO3' })
  public countryCode: string;

  @Column()
  public adminLevel: number;

  @Column()
  public placeCode: string;

  @Column()
  public key: ExposureUnit;

  @Column({ type: 'date' })
  public date: Date;

  @Column({ nullable: true, type: 'real' })
  public value: number;

  @ManyToOne((): typeof LeadTimeEntity => LeadTimeEntity)
  @JoinColumn({ name: 'leadTime', referencedColumnName: 'leadTimeName' })
  public leadTime: string;
}
