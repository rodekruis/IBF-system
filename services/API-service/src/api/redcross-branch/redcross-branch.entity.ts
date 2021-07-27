import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../country/country.entity';

@Entity('redcross-branch')
export class RedcrossBranchEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @Column()
  public name: string;

  @Column({ nullable: true })
  public numberOfVolunteers: number;

  @Column({ nullable: true })
  public contactPerson: string;

  @Column({ nullable: true })
  public contactAddress: string;

  @Column({ nullable: true })
  public contactNumber: string;

  @Column('json', { nullable: true })
  public geom: JSON;
}
