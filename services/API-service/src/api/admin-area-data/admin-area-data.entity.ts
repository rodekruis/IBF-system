import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CountryEntity } from '../country/country.entity';

@Entity('admin-area-data')
export class AdminAreaDataEntity {
  @PrimaryGeneratedColumn('uuid')
  public adminAreaDataId: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @Column()
  public adminLevel: number;

  @Index()
  @Column()
  public placeCode: string;

  @Column()
  public indicator: string;

  @Column({ nullable: true, type: 'real' })
  public value: number;
}
